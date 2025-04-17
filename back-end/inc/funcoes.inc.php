<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include("../cors.php");
include("ambiente.inc.php");
include("../log/log.php");
require_once dirname(__DIR__, 2) . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(dirname(__DIR__, 2));
$dotenv->load();

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../../vendor/phpmailer/phpmailer/src/Exception.php';
require '../../vendor/phpmailer/phpmailer/src/PHPMailer.php';
require '../../vendor/phpmailer/phpmailer/src/SMTP.php';
require '../../vendor/autoload.php';

/********************************* FUNÇÕES AUXILIARES *************************************/

/**
 * Valida se todos os campos obrigatórios estão presentes em um array de dados.
 * 
 * @param array $data Array de dados a ser validado.
 * @param array $requiredFields Array com os campos obrigatórios que devem ser verificados.
 * 
 * @return array|null Retorna um array com chave 'success' e 'message' caso haja um erro,
 *         ou null caso todos os campos sejam válidos.
 */
function validarCampos($data, $requiredFields)
{
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            return ["success" => false, "message" => "O campo " . $field . " é obrigatório."];
        }
    }
    return null;
}

/**
 * Verifica se um cargo existe na base de dados e retorna seu ID.
 * 
 * @param mysqli $conn Conex o com o banco de dados.
 * @param string $cargo Nome do cargo a ser verificado.
 * 
 * @return array|integer Retorna um array com chave 'success' e 'message' caso 
 *         haja um erro, ou o ID do cargo como inteiro caso ele seja encontrado.
 */
function verificarCargo($conn, $cargo)
{
    $stmt = $conn->prepare("SELECT car_id FROM cargo WHERE car_nome = ?");
    if (!$stmt) {
        return ["success" => false, "message" => "Erro ao preparar consulta de cargos: " . $conn->error];
    }
    $stmt->bind_param("s", $cargo);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        return ["success" => false, "message" => "Cargo não encontrado."];
    }
    $cargo = $result->fetch_assoc();
    $stmt->close();
    return $cargo['car_id'];
}

/**
 * Verifica se um nível de acesso existe no banco de dados.
 *
 * @param mysqli $conn Conexão com o banco de dados.
 * @param string $nivel Nome do nível de acesso a ser verificado.
 *
 * @return int|stdClass Se o nível existir, retorna o ID do nível.
 *                       Se o nível não existir, retorna um objeto com as propriedades
 *                       "success" => false e "message" => string com a mensagem de erro.
 */
function verificarNivel($conn, $nivel)
{
    $stmt = $conn->prepare("SELECT nivel_id FROM niveis_acesso WHERE nivel_nome = ?");
    if (!$stmt) {
        return ["success" => false, "message" => "Erro ao preparar consulta de níveis: " . $conn->error];
    }
    $stmt->bind_param("s", $nivel);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        return ["success" => false, "message" => "Nível de acesso não encontrado."];
    }
    $nivel = $result->fetch_assoc();
    $stmt->close();
    return $nivel['nivel_id'];
}

/**
 * Verifica se o status existe e retorna o ID do status.
 * @param mysqli $conn conex o ao banco de dados
 * @param string $status nome do status a ser verificado
 * @return int|null retorna o ID do status ou null se houver erro na query ou se o status não existir
 */
function verificarStatus($conn, $status)
{
    $stmt = $conn->prepare("SELECT sta_id, sta_nome FROM status WHERE sta_id = ?");
    if (!$stmt) {
        return null; // Retorna null em caso de erro na query
    }

    $stmt->bind_param("s", $status);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        return null; // Retorna null quando status não existe
    }

    $row = $result->fetch_assoc();
    $stmt->close();
    return $row['sta_id']; // Retorna apenas o ID
}


/**
 * Registra a exclusão de um registro em uma tabela de log de exclusões.
 * @param object $conn Conexão com o banco de dados.
 * @param string $table Nome da tabela onde será feita a inserção.
 * @param array $fields Array associativo com chaves e valores a serem inseridos.
 * 
 * @return array Retorna um array com uma chave 'success' booleana e, se houver erro,
 *               uma chave 'message' com a descrição do erro. Caso a inserção seja
 *               bem-sucedida, retorna também a chave 'insert_id' com o ID do registro
 *               inserido.
 */
function registerDeletion($conn, $table, $fields)
{
    if (!is_array($fields) || empty($fields)) {
        return [
            'success' => false,
            'message' => 'Nenhum dado fornecido para registrar exclusão.'
        ];
    }

    $columns = array_keys($fields);
    $placeholders = implode(', ', array_fill(0, count($columns), '?'));

    // Query final sem adicionar manualmente o campo de data
    $sql = "INSERT INTO {$table} (" . implode(', ', $columns) . ") VALUES ({$placeholders})";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        return [
            'success' => false,
            'message' => 'Erro ao preparar a query: ' . $conn->error
        ];
    }

    $types = '';
    $values = [];

    foreach ($fields as $value) {
        if (is_int($value)) {
            $types .= 'i';
        } elseif (is_double($value)) {
            $types .= 'd';
        } else {
            $types .= 's';
        }
        $values[] = $value;
    }

    $stmt->bind_param($types, ...$values);

    if (!$stmt->execute()) {
        return [
            'success' => false,
            'message' => 'Erro ao executar a exclusão: ' . $stmt->error
        ];
    }

    return ['success' => true, 'insert_id' => $stmt->insert_id];
}

/**
 * Exclui um registro de uma tabela
 *
 * @param mysqli $conn      conexão com o banco de dados
 * @param int    $id        ID do registro a ser excluido
 * @param string $tabela    nome da tabela que contem o registro
 * @param string $pk        nome da chave primaria da tabela
 *
 * @return array            resposta com um sucesso boolean e uma mensagem de erro
 */
function deleteData($conn, $id, $tabela, $pk)
{
    $stmt = $conn->prepare('DELETE FROM ' . $tabela . ' WHERE ' . $pk . ' = ?');

    if (!$stmt) {
        return [
            'success' => false,
            'message' => 'Falha ao preparar a exclusão'
        ];
    }

    $stmt->bind_param('i', $id);

    if (!$stmt->execute()) {
        return [
            'success' => false,
            'message' => 'Falha ao executar a exclusão'
        ];
    }

    if ($stmt->affected_rows === 0) {
        return [
            'success' => false,
            'message' => 'Nenhum usuário encontrado com este ID'
        ];
    }

    return ['success' => true];
}


/**
 * Envia um e-mail com base nos parâmetros informados
 *
 * @param array|null $from      informações de quem está enviando o e-mail
 *                               deve conter "email" e "name" (opcional)
 * @param string     $to        e-mail do destinatário
 * @param string     $subject   assunto do e-mail
 * @param string     $htmlMessage conteúdo do e-mail em HTML
 * @param string     $plainMessage conteúdo do e-mail em texto puro (opcional)
 *
 * @return array               resposta com um sucesso boolean e uma mensagem de erro
 */
function sendEmail($from = null, $to, $subject, $htmlMessage, $plainMessage = '')
{
    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host = $_ENV['MAIL_HOST'];
        $mail->SMTPAuth = true;
        $mail->Username = $_ENV['MAIL_USERNAME'];
        $mail->Password = $_ENV['MAIL_PASSWORD'];
        $mail->SMTPSecure = $_ENV['MAIL_ENCRYPTION'];
        $mail->Port = $_ENV['MAIL_PORT'];

        $fromEmail = $from['email'] ?? $_ENV['MAIL_FROM_EMAIL'];
        $fromName = $from['name'] ?? $_ENV['MAIL_FROM_NAME'];

        $mail->setFrom($fromEmail, $fromName);
        $mail->addAddress($to);

        $mail->isHTML(true);
        $mail->CharSet = 'UTF-8';
        $mail->Subject = $subject;
        $mail->Body = $htmlMessage;
        $mail->AltBody = $plainMessage ?: strip_tags($htmlMessage);

        $mail->send();
        return ['success' => true];
    } catch (Exception $e) {
        return ['success' => false, 'message' => "Erro ao enviar e-mail: " . $mail->ErrorInfo];
    }
}

/**
 * Envia um e-mail para o usuário com seus dados de acesso
 *
 * @param string $email e-mail do usuário
 * @param array $data dados do usuário, deve conter "email" e "password"
 *
 * @return array resposta com um sucesso boolean e uma mensagem de erro
 */
function enviarEmailCadastro($email, $data)
{
    $html = "
        <html>
        <body style='font-family: Arial, sans-serif; background-color: #e8f5e9; margin: 0; padding: 0;'>
            <div style='max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 15px; overflow: hidden; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);'>
                <div style='background: linear-gradient(135deg, #2e7d32, #4caf50); padding: 30px; text-align: center;'>
                    <h1 style='color: #ffffff; font-size: 26px; margin: 0;'>Bem-vindo à Bio Verde</h1>
                    <p style='color: #e0f2e9; font-size: 16px; margin: 10px 0 0;'>Seu cadastro foi concluído com sucesso!</p>
                </div>
                <div style='padding: 30px; color: #333333;'>
                    <p style='font-size: 18px; line-height: 1.6;'>Olá,</p>
                    <p style='font-size: 18px; line-height: 1.6;'>Agora você faz parte do nosso sistema! Seguem abaixo seus dados de acesso:</p>
                    <div style='background-color: #f1f8e9; padding: 15px; border-radius: 10px; text-align: center; margin: 20px 0;'>
                        <p style='color: #2e7d32; font-size: 18px;'><strong>Email:</strong> " . $data['email'] . "</p>
                        <p style='color: #2e7d32; font-size: 18px;'><strong>Senha:</strong> " . $data['password'] . "</p>
                    </div>
                    <p style='font-size: 16px; line-height: 1.6;'>Guarde essas informações com segurança. Em caso de dúvidas, entre em contato conosco.</p>
                    <p style='font-size: 16px; line-height: 1.6;'>Atenciosamente,<br><strong>Equipe Bio Verde</strong></p>
                </div>
                <div style='background-color: #c8e6c9; padding: 20px; text-align: center; font-size: 14px; color: #2e7d32;'>
                    Este é um e-mail automático, por favor não responda.
                </div>
            </div>
        </body>
        </html>
    ";

    return sendEmail(
        null,
        $email,
        'Bio Verde - Cadastro realizado com sucesso!',
        $html
    );
}

/**
 * Busca todos os cargos registrados no banco de dados.
 *
 * @param mysqli $conn Conex o com o banco de dados.
 *
 * @return array Retorna um array com os cargos, onde cada cargo
 *         é representado por um array com as chaves 'car_id' e 'car_nome'.
 *
 * @throws Exception Caso ocorra um erro ao buscar os cargos.
 */
function buscarCargos($conn)
{
    $result = $conn->query("SELECT car_id, car_nome FROM cargo");
    if (!$result) {
        throw new Exception("Erro ao buscar cargos: " . $conn->error);
    }

    $cargos = [];
    while ($row = $result->fetch_assoc()) {
        $cargos[] = $row;
    }

    return $cargos;
}

/**
 * Busca todos os níveis de acesso registrados no banco de dados.
 *
 * @param mysqli $conn Conex o com o banco de dados.
 *
 * @return array Retorna um array com os níveis de acesso, onde cada nível
 *         é representado por um array com as chaves 'nivel_id' e 'nivel_nome'.
 *
 * @throws Exception Caso ocorra um erro ao buscar os níveis de acesso.
 */
function buscarNiveisAcesso($conn)
{
    $result = $conn->query("SELECT nivel_id, nivel_nome FROM niveis_acesso");
    if (!$result) {
        throw new Exception("Erro ao buscar níveis de acesso: " . $conn->error);
    }

    $niveis = [];
    while ($row = $result->fetch_assoc()) {
        $niveis[] = $row;
    }

    return $niveis;
}

/**
 * Busca todos os status registrados no banco de dados.
 *
 * @param mysqli $conn Conex o com o banco de dados.
 *
 * @return array Retorna um array com os status, onde cada status
 *         é representado por um array com as chaves 'sta_id' e 'sta_nome'.
 *
 * @throws Exception Caso ocorra um erro ao buscar os status.
 */
function buscarStatus($conn)
{
    $result = $conn->query("SELECT sta_id, sta_nome FROM status");
    if (!$result) {
        throw new Exception("Erro ao buscar status: " . $conn->error);
    }

    $status = [];
    while ($row = $result->fetch_assoc()) {
        $status[] = $row;
    }

    return $status;
}

function enviarEmailRecuperacao($email, $codigo)
{
    $html = "        <html>
        <body style='font-family: Arial, sans-serif; background-color: #e8f5e9; margin: 0; padding: 0;'>
            <div style='max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 15px; overflow: hidden; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);'>
                <div style='background: linear-gradient(135deg, #2e7d32, #4caf50); padding: 30px; text-align: center;'>
                    <h1 style='color: #ffffff; font-size: 28px; margin: 0;'>Recuperação de Senha</h1>
                    <p style='color: #e0f2e9; font-size: 16px; margin: 10px 0 0;'>Segurança e praticidade para você</p>
                </div>
    
                <div style='padding: 30px; color: #333333;'>
                    <p style='font-size: 18px; line-height: 1.6;'>Olá,</p>
                    <p style='font-size: 18px; line-height: 1.6;'>Seu código de recuperação é:</p>
                    <div style='background-color: #f1f8e9; padding: 15px; border-radius: 10px; text-align: center; margin: 20px 0;'>
                        <strong style='color: #2e7d32; font-size: 24px; letter-spacing: 2px;'>{$codigo}</strong>
                    </div>
                    <p style='font-size: 18px; line-height: 1.6;'>Se você não solicitou essa recuperação, por favor, ignore este e-mail.</p>
                    <p style='font-size: 16px; color: #777777; margin-top: 20px;'>Atenciosamente,<br>Equipe da Bio Verde</p>
                </div>
    
                <div style='background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; color: #777777;'>
                    <p style='margin: 0;'>Este é um e-mail automático, por favor não responda.</p>
                    <p style='margin: 5px 0 0;'>&copy; " . date('Y') . " Bio Verde. Todos os direitos reservados.</p>
                </div>
            </div>
        </body>
        </html>"

    ;

    return sendEmail(
        null,
        $email,
        'Bio Verde - Recuperação de senha!',
        $html
    );
}

/**
 * Atualiza um registro em uma tabela do banco de dados.
 *
 * @param mysqli $conn Conexao com o banco de dados.
 * @param string $table Nome da tabela que deseja atualizar.
 * @param array $fields Array com os campos e valores a serem atualizados.
 *                       A chave do array deve ser o nome do campo e o valor
 *                       deve ser o valor a ser atualizado.
 * @param int|string $id ID do registro a ser atualizado.
 * @param string $idField Nome do campo que cont m o ID do registro.
 *
 * @return array Retorna um array com as chaves 'success' e 'message'.
 *               Se a atualização for bem-sucedida, 'success' ser  true e
 *               'message' ser  uma string vazia. Caso contrario, 'success'
 *               ser  false e 'message' conter a descrição do erro.
 */
function updateData($conn, $table, $fields, $id, $idField)
{
    if (!is_array($fields) || empty($fields)) {
        return [
            'success' => false,
            'message' => 'Nenhum dado fornecido para atualização.'
        ];
    }

    $setClause = implode(', ', array_map(fn($key) => "$key = ?", array_keys($fields)));
    $sql = "UPDATE {$table} SET {$setClause} WHERE {$idField} = ?";

    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        return [
            'success' => false,
            'message' => 'Erro ao preparar a query: ' . $conn->error
        ];
    }

    $types = '';
    $values = [];

    foreach ($fields as $value) {
        if (is_int($value)) {
            $types .= 'i';
        } elseif (is_double($value)) {
            $types .= 'd';
        } else {
            $types .= 's';
        }
        $values[] = $value;
    }

    // Adiciona o ID ao final dos parâmetros
    $types .= is_int($id) ? 'i' : 's';
    $values[] = $id;

    $stmt->bind_param($types, ...$values);

    if (!$stmt->execute()) {
        return [
            'success' => false,
            'message' => 'Erro ao atualizar cliente: ' . $stmt->error
        ];
    }

    return ['success' => true];
}

/******************************************************************************/

// listar_usuarios.php

function buscarUsuarios($conn)
{
    $result = $conn->query("
        SELECT 
            u.user_id, 
            u.user_nome, 
            u.user_email, 
            u.user_telefone, 
            u.user_CPF, 
            c.car_nome, 
            n.nivel_nome, 
            s.sta_nome,
            u.user_dtcadastro, 
            u.car_id, 
            u.nivel_id,
            u.sta_id
        FROM usuarios u 
        INNER JOIN cargo c ON u.car_id = c.car_id 
        INNER JOIN niveis_acesso n ON u.nivel_id = n.nivel_id
        LEFT JOIN status s ON u.sta_id = s.sta_id  -- JOIN com a tabela status
    ");

    if (!$result) {
        throw new Exception("Erro ao buscar usuários: " . $conn->error);
    }

    $usuarios = [];
    while ($row = $result->fetch_assoc()) {
        $usuarios[] = $row;
    }

    return $usuarios;
}

// nova.senha.php

function verificarSenhaAtual($conn, $email, $novaSenha)
{
    $sql = "SELECT user_senha FROM usuarios WHERE user_email = ?";
    $res = $conn->prepare($sql);
    $res->bind_param("s", $email);
    $res->execute();
    $res->store_result();

    if ($res->num_rows > 0) {
        $res->bind_result($senhaArmazenada);
        $res->fetch();

        // Verificar se a nova senha é igual à atual
        if (password_verify($novaSenha, $senhaArmazenada)) {
            return true;
        }
    }
    return false;
}

function atualizarSenha($conn, $email, $novaSenha)
{
    $senhaHash = password_hash($novaSenha, PASSWORD_DEFAULT);

    $sql = "UPDATE usuarios SET user_senha = ? WHERE user_email = ?";
    $res = $conn->prepare($sql);
    $res->bind_param("ss", $senhaHash, $email);
    $res->execute();

    if ($res->affected_rows > 0) {
        return true;
    } else {
        return false;
    }
}

// recuperar.senha.php


function gerarCodigoRecuperacao($tamanho = 6)
{
    $alfabeto = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $codigo = '';
    for ($i = 0; $i < $tamanho; $i++) {
        $codigo .= $alfabeto[rand(0, strlen($alfabeto) - 1)];
    }
    return $codigo;
}


function verificarEmailExiste($conn, $email)
{
    $sql = "SELECT user_email FROM usuarios WHERE user_email = ?";
    $res = $conn->prepare($sql);
    if (!$res) {
        return ["success" => false, "message" => "Erro ao preparar consulta: " . $conn->error];
    }
    $res->bind_param("s", $email);
    $res->execute();
    $res->store_result();
    $existe = $res->num_rows > 0;
    $res->close();
    return $existe;
}

function atualizarCodigoRecuperacao($conn, $email, $codigo)
{
    $update_sql = "UPDATE usuarios SET codigo_recuperacao = ? WHERE user_email = ?";
    $update_stmt = $conn->prepare($update_sql);
    if (!$update_stmt) {
        return ["success" => false, "message" => "Erro ao preparar atualização: " . $conn->error];
    }
    $update_stmt->bind_param("ss", $codigo, $email);
    $update_stmt->execute();
    $sucesso = $update_stmt->affected_rows > 0;
    $update_stmt->close();
    return $sucesso;
}

// verificar-codigo.php

function verificarCodigoRecuperacao($conn, $codigo)
{

    $sql = " SELECT user_email, codigo_recuperacao_expira_em ";
    $sql .= " FROM usuarios ";
    $sql .= " WHERE codigo_recuperacao = ? ";
    $sql .= " AND (codigo_recuperacao_expira_em IS NULL OR codigo_recuperacao_expira_em > NOW()) ";

    $res = $conn->prepare($sql);
    if (!$res) {
        return ["success" => false, "message" => "Erro ao preparar consulta: " . $conn->error];
    }

    $res->bind_param("s", $codigo);
    $res->execute();
    $res->store_result();

    $valido = $res->num_rows > 0;
    $res->close();

    return $valido;
}

// login.php

function verificarCredenciais($conn, $email, $password)
{
    $sql = "SELECT user_id, user_nome, user_senha FROM usuarios WHERE user_email = ?";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        return ["success" => false, "message" => "Erro ao preparar consulta: " . $conn->error];
    }

    $stmt->bind_param("s", $email);
    $stmt->execute();
    $res = $stmt->get_result();

    if ($res->num_rows === 0) {
        return ["success" => false, "message" => "Usuário não encontrado"];
    }

    $userData = $res->fetch_assoc();

    if (!password_verify($password, $userData["user_senha"])) {
        return ["success" => false, "message" => "Senha incorreta"];
    }

    return [
        "success" => true,
        "user" => [
            "id" => $userData["user_id"],
            "nome" => $userData["user_nome"]
        ]
    ];
}

function configurarSessaoSegura()
{
    ini_set('session.cookie_httponly', 1);
    ini_set('session.cookie_secure', 0);
    ini_set('session.cookie_samesite', 'Lax');
    ini_set('session.use_strict_mode', 1);
    ini_set('session.cookie_lifetime', 0);
    ini_set('session.gc_maxlifetime', 1800);
}

// filtro.usuario.php

/**
 * Constrói a cláusula WHERE para filtros de usuários
 */
function construirFiltrosUsuarios($data)
{
    $mapaFiltros = [
        "fname" => "user_nome",
        "femail" => "user_email",
        "ftel" => "user_telefone",
        "fcpf" => "user_CPF",
        "fcargo" => "car_nome",
        "fnivel" => "nivel_nome",
        "fstatus" => "sta_id",
        "fdataCadastro" => "user_dtcadastro"
    ];

    $where = [];
    $valores = [];
    $tipos = "";

    foreach ($mapaFiltros as $param => $coluna) {
        if (!empty($data[$param])) {
            if ($param === "fname") {
                $where[] = "LOWER($coluna) LIKE LOWER(?)";
                $valores[] = '%' . trim($data[$param]) . '%';
                $tipos .= "s";
            } else {
                $where[] = "$coluna = ?";
                $valores[] = trim($data[$param]);
                $tipos .= "s";
            }
        }
    }

    return [
        'where' => $where,
        'valores' => $valores,
        'tipos' => $tipos
    ];
}

function buscarUsuariosComFiltros($conn, $filtros)
{
    $sql = "SELECT u.user_id, u.user_nome, u.user_email, u.user_telefone, u.user_CPF,";
    $sql .= " c.car_nome, n.nivel_nome, u.sta_id, u.user_dtcadastro";
    $sql .= " FROM usuarios u";
    $sql .= " INNER JOIN cargo c ON u.car_id = c.car_id";
    $sql .= " INNER JOIN niveis_acesso n ON u.nivel_id = n.nivel_id";
    $sql .= " LEFT JOIN status s ON u.sta_id = s.sta_id";

    if (!empty($filtros['where'])) {
        // Modificar as condições que envolvem user_dtcadastro
        $modifiedWhere = [];
        foreach ($filtros['where'] as $condition) {
            if (strpos($condition, 'user_dtcadastro') !== false) {
                // Substituir user_dtcadastro por DATE(user_dtcadastro)
                $condition = preg_replace('/user_dtcadastro\s*(=|!=|>|<|>=|<=|LIKE)/', 'DATE(user_dtcadastro) $1', $condition);
            }
            $modifiedWhere[] = $condition;
        }
        $sql .= " WHERE " . implode(" AND ", $modifiedWhere);
    }

    $stmt = $conn->prepare($sql);

    if (!empty($filtros['valores'])) {
        $stmt->bind_param($filtros['tipos'], ...$filtros['valores']);
    }

    $stmt->execute();
    $result = $stmt->get_result();
    $usuarios = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    return $usuarios;
}

// editar.usuario.php

/**
 * Verifica conflitos de email/CPF (excluindo o próprio usuário)
 */
function verificarConflitosAtualizacao($conn, $email, $cpf, $user_id)
{
    $stmt = $conn->prepare("SELECT user_id FROM usuarios WHERE (user_email = ? OR user_CPF = ?) AND user_id != ?");
    if (!$stmt) {
        return ["success" => false, "message" => "Erro ao preparar consulta: " . $conn->error];
    }
    $stmt->bind_param("ssi", $email, $cpf, $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $conflito = $result->fetch_assoc();
        return ["success" => false, "message" => "E-mail ou CPF já está em uso por outro usuário."];
    }
    return null;
}

/**
 * Obtém o ID do status pelo nome
 */
function obterIdStatusPorNome($conn, $nomeStatus)
{
    if (empty($nomeStatus)) {
        return null;
    }

    // Verifica se o parâmetro é numérico (ID) ou string (nome)
    if (is_numeric($nomeStatus)) {
        $stmt = $conn->prepare("SELECT sta_id FROM status WHERE sta_id = ?");
    } else {
        $stmt = $conn->prepare("SELECT sta_id FROM status WHERE sta_nome = ?");
    }

    if (!$stmt) {
        return ["success" => false, "message" => "Erro ao preparar consulta: " . $conn->error];
    }

    $stmt->bind_param("s", $nomeStatus);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        return null;
    }

    $row = $result->fetch_assoc();
    return $row['sta_id'];
}

/**
 * Busca um usuário pelo seu ID
 * 
 * @param mysqli $conn Conex o com o banco de dados
 * @param int $user_id ID do usu rio a ser buscado
 * 
 * @return array|null Associativo com os dados do usu rio, ou null se n o encontrado
 */
function buscarUsuarioPorId($conn, $user_id)
{
    $stmt = $conn->prepare("
        SELECT 
            u.user_id, 
            u.user_nome, 
            u.user_email, 
            u.user_telefone, 
            u.user_CPF, c.car_nome, 
            n.nivel_nome, 
            s.sta_nome,
            u.user_dtcadastro, 
            u.car_id, 
            u.nivel_id,
            u.sta_id
        FROM usuarios u 
        INNER JOIN cargo c ON u.car_id = c.car_id 
        INNER JOIN niveis_acesso n ON u.nivel_id = n.nivel_id
        LEFT JOIN status s ON u.sta_id = s.sta_id
        WHERE u.user_id = ?
    ");

    if (!$stmt) {
        return null;
    }

    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    return $result->fetch_assoc();
}

// excluir.usuario.php

// funcoes.inc.php

function registrarExclusaoUsuario($conn, $user_id, $dados)
{
    $stmt = $conn->prepare("INSERT INTO usuarios_excluidos (
        usuex_excluido, 
        usuex_exclusao, 
        usuex_motivo_exclusao,
        usuex_dtexclusao
    ) VALUES (?, ?, ?, NOW())");

    if (!$stmt) {
        return [
            'success' => false,
            'message' => 'Falha ao preparar o registro de exclusão'
        ];
    }

    $stmt->bind_param('sis', $dados['dname'], $user_id, $dados['reason']);

    if (!$stmt->execute()) {
        return [
            'success' => false,
            'message' => 'Falha ao registrar a exclusão'
        ];
    }

    return ['success' => true, 'insert_id' => $stmt->insert_id];
}

// cadastrar_fornecedores.php


/**
 * Envia um e-mail de confirmação de cadastro de fornecedor
 * @param string $email e-mail do fornecedor
 * @param array $data dados do fornecedor
 * @return bool|array retorna true se o e-mail for enviado com sucesso ou um array com a chave "success" como false e "message" com a mensagem de erro
 */
function enviarEmailFornecedor($email, $data)
{
        $html= "
                <html>
                <body style='font-family: Arial, sans-serif; background-color: #e8f5e9; margin: 0; padding: 0;'>
                    <div style='max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 15px; overflow: hidden; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);'>
                        <div style='background: linear-gradient(135deg, #2e7d32, #4caf50); padding: 30px; text-align: center;'>
                            <h1 style='color: #ffffff; font-size: 26px; margin: 0;'>Bem-vindo à Bio Verde</h1>
                            <p style='color: #e0f2e9; font-size: 16px; margin: 10px 0 0;'>Seu cadastro foi concluído com sucesso!</p>
                        </div>
                        <div style='padding: 30px; color: #333333;'>
                            <p style='font-size: 18px; line-height: 1.6;'>Olá,</p>
                            <p style='font-size: 18px; line-height: 1.6;'>Agora você faz parte do nosso sistema!</p>
                            <p style='font-size: 18px; line-height: 1.6;'>Em nome da BioVerde, gostariamos de agradecer pela confiança em nossos serviços.</p>
                            <p style='font-size: 18px; line-height: 1.6;'>Seguem abaixo os dados cadastrados no sistema:</p>
                            <div style='background-color: #f1f8e9; padding: 15px; border-radius: 10px; text-align: center; margin: 20px 0;'>
                                <p style='color: #2e7d32; font-size: 18px;'><strong>Nome da Empresa: </strong> " . $data['nome_empresa'] . "</p>
                                <p style='color: #2e7d32; font-size: 18px;'><strong>Razão Social: </strong> " . $data['razao_social'] . "</p>
                                <p style='color: #2e7d32; font-size: 18px;'><strong>E-mail: </strong> " . $data['email'] . "</p>
                                <p style='color: #2e7d32; font-size: 18px;'><strong>CPF/CNPJ: </strong> " . $data['cnpj'] . "</p>
                                <p style='color: #2e7d32; font-size: 18px;'><strong>Endereço: </strong> " . $data['endereco'] . " - Número: " . $data['num_endereco'] . "</p>
                                <p style='color: #2e7d32; font-size: 18px;'><strong>Cidade: </strong> " . $data['cidade'] . "</p>
                                <p style='color: #2e7d32; font-size: 18px;'><strong>Estado: </strong> " . $data['estado'] . "</p>
                                <p style='color: #2e7d32; font-size: 18px;'><strong>Cep: </strong> " . $data['cep'] . "</p>
                                <p style='color: #2e7d32; font-size: 18px;'><strong>Responsável: </strong> " . $data['responsavel'] . "</p>
                            </div>
                            <p style='font-size: 16px; color: #777777; margin-top: 20px;'>Se precisar de ajuda, entre em contato com nosso suporte.</p>
                            <p style='font-size: 16px; color: #777777; margin-top: 20px;'>Atenciosamente,<br>Equipe Bio Verde</p>
                        </div>
                        <div style='background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; color: #777777;'>
                            <p style='margin: 0;'>Este é um e-mail automático. Não é necessário respondê-lo.</p>
                            <p style='margin: 5px 0 0;'>&copy; <?php echo date('Y'); ?> Bio Verde. Todos os direitos reservados.</p>
                        </div>
                    </div>
                </body>
                </html>
        ";

    return sendEmail(
        null,
        $email,
        'Bio Verde - Cadastro de fornecedor realizado com sucesso!',
        $html
    );
}

// listar_fornecedores.php

function buscarFornecedores($conn)
{

    $result = $conn->query("
        SELECT 
            fornecedor_id,
            fornecedor_nome,
            fornecedor_razao_social,
            fornecedor_email,
            fornecedor_telefone,
            fornecedor_CNPJ,
            fornecedor_responsavel,
            fornecedor_cep,
            fornecedor_endereco,
            fornecedor_num_endereco,
            fornecedor_estado,
            fornecedor_cidade,
            b.sta_nome,
            b.sta_id,
            fornecedor_dtcadastro
        FROM fornecedores a
        INNER JOIN status b ON a.fornecedor_status = b.sta_id
        ");

    if (!$result) {
        throw new Exception("Erro ao buscar usuários: " . $conn->error);
    }

    $fornecedores = [];
    while ($row = $result->fetch_assoc()) {
        $fornecedores[] = $row;
    }

    return $fornecedores;
}

// filtro.fornecedor.php

function construirFiltrosFornecedores($data)
{
    $mapaFiltros = [
        "fnome_empresa" => "fornecedor_nome",
        "fresponsavel" => "fornecedor_responsavel",
        "fcnpj" => "fornecedor_CNPJ",
        "ftel" => "fornecedor_telefone",
        "fcidade" => "fornecedor_cidade",
        "festado" => "fornecedor_estado",
        "fdataCadastro" => "fornecedor_dtcadastro",
        "fstatus" => "fornecedor_status",
    ];

    $where = [];
    $valores = [];
    $tipos = "";

    foreach ($mapaFiltros as $param => $coluna) {
        if (!empty($data[$param])) {
            if ($param === "fnome_empresa") {
                $where[] = "LOWER($coluna) LIKE LOWER(?)";
                $valores[] = '%' . trim($data[$param]) . '%';
                $tipos .= "s";
            } else {
                $where[] = "$coluna = ?";
                $valores[] = trim($data[$param]);
                $tipos .= "s";
            }
        }
    }

    return [
        'where' => $where,
        'valores' => $valores,
        'tipos' => $tipos
    ];
}


function buscarFornecedoresComFiltros($conn, $filtros)
{

    $sql = "SELECT fornecedor_id, fornecedor_nome, fornecedor_razao_social, fornecedor_email, fornecedor_telefone, fornecedor_CNPJ, fornecedor_responsavel,";
    $sql .= " fornecedor_cep, fornecedor_endereco, fornecedor_estado, fornecedor_cidade, b.sta_nome, fornecedor_dtcadastro";
    $sql .= " FROM fornecedores a";
    $sql .= " LEFT JOIN status b ON a.fornecedor_status = b.sta_id";

    if (!empty($filtros['where'])) {
        // Modificar as condições que envolvem fornecedor_dtcadastro
        $modifiedWhere = [];
        foreach ($filtros['where'] as $condition) {
            if (strpos($condition, 'fornecedor_dtcadastro') !== false) {
                // Substituir forneced por DATE(fornecedor_dtcadastro)
                $condition = preg_replace('/fornecedor_dtcadastro\s*(=|!=|>|<|>=|<=|LIKE)/', 'DATE(fornecedor_dtcadastro) $1', $condition);
            }
            $modifiedWhere[] = $condition;
        }
        $sql .= " WHERE " . implode(" AND ", $modifiedWhere);
    }

    $stmt = $conn->prepare($sql);

    if (!empty($filtros['valores'])) {
        $stmt->bind_param($filtros['tipos'], ...$filtros['valores']);
    }

    $stmt->execute();
    $result = $stmt->get_result();
    $usuarios = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    return $usuarios;
}

// editar.fornecedor.php

// excluir.fornecedor.php

function registrarExclusaoFornecedor($conn, $user_id, $dados)
{
    $stmt = $conn->prepare("INSERT INTO fornecedores_excluidos (
        forex_excluido, 
        forex_exclusao, 
        forex_motivo_exclusao,
        forex_dtexclusao
    ) VALUES (?, ?, ?, NOW())");

    if (!$stmt) {
        return [
            'success' => false,
            'message' => 'Falha ao preparar o registro de exclusão'
        ];
    }

    $stmt->bind_param('sis', $dados['dnome_empresa'], $user_id, $dados['reason']);

    if (!$stmt->execute()) {
        return [
            'success' => false,
            'message' => 'Falha ao registrar a exclusão'
        ];
    }

    return ['success' => true, 'insert_id' => $stmt->insert_id];
}

// cadastrar_clientes.php

function verifyCredentials($conn, $valor1, $valor2, $tabela, $coluna1, $coluna2){

    $sql = "SELECT * FROM $tabela WHERE $coluna1 = ? AND $coluna2 = ?";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        return ["success" => false, "message" => "Erro ao preparar a query: " . $conn->error];
    }

    $stmt->bind_param('ss', $valor1, $valor2);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        return ["success" => false, "message" => "E-mail ou CPF/CNPJ já existe."];
    }

    return null;
}


function enviarEmailCliente($email, $data)
{

    $html = "
                <html>
                <body style='font-family: Arial, sans-serif; background-color: #e8f5e9; margin: 0; padding: 0;'>
                    <div style='max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 15px; overflow: hidden; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);'>
                        <div style='background: linear-gradient(135deg, #2e7d32, #4caf50); padding: 30px; text-align: center;'>
                            <h1 style='color: #ffffff; font-size: 26px; margin: 0;'>Bem-vindo à Bio Verde</h1>
                            <p style='color: #e0f2e9; font-size: 16px; margin: 10px 0 0;'>Seu cadastro foi concluído com sucesso!</p>
                        </div>
                        <div style='padding: 30px; color: #333333;'>
                            <p style='font-size: 18px; line-height: 1.6;'>Olá,</p>
                            <p style='font-size: 18px; line-height: 1.6;'>Agora você faz parte do nosso sistema!</p>
                            <p style='font-size: 18px; line-height: 1.6;'>Em nome da BioVerde, gostariamos de agradecer pela confiança em nossos serviços.</p>
                            <p style='font-size: 18px; line-height: 1.6;'>Seguem abaixo os dados cadastrados no sistema:</p>
                            <div style='background-color: #f1f8e9; padding: 15px; border-radius: 10px; text-align: center; margin: 20px 0;'>
                                <p style='color: #2e7d32; font-size: 18px;'><strong>Nome do Cliente: </strong> " . $data['nome_cliente'] . "</p>
                                <p style='color: #2e7d32; font-size: 18px;'><strong>CPF/CNPJ: </strong> " . $data['cpf_cnpj'] . "</p>
                                <p style='color: #2e7d32; font-size: 18px;'><strong>Telefone/Celular: </strong> " . $data['tel'] . "</p>
                                <p style='color: #2e7d32; font-size: 18px;'><strong>E-mail: </strong> " . $data['email'] . "</p>
                                <p style='color: #2e7d32; font-size: 18px;'><strong>Endereço: </strong> " . $data['endereco'] . " - Número: " . $data['num_endereco'] . "</p>
                                <p style='color: #2e7d32; font-size: 18px;'><strong>Cidade: </strong> " . $data['cidade'] . "</p>
                                <p style='color: #2e7d32; font-size: 18px;'><strong>Estado: </strong> " . $data['estado'] . "</p>
                                <p style='color: #2e7d32; font-size: 18px;'><strong>Cep: </strong> " . $data['cep'] . "</p>
                                <p style='color: #2e7d32; font-size: 18px;'><strong>Observações: </strong> " . $data['obs'] . "</p>
                            </div>
                            <p style='font-size: 16px; color: #777777; margin-top: 20px;'>Se precisar de ajuda, entre em contato com nosso suporte.</p>
                            <p style='font-size: 16px; color: #777777; margin-top: 20px;'>Atenciosamente,<br>Equipe Bio Verde</p>
                        </div>
                        <div style='background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; color: #777777;'>
                            <p style='margin: 0;'>Este é um e-mail automático. Não é necessário respondê-lo.</p>
                            <p style='margin: 5px 0 0;'>&copy; <?php echo date('Y'); ?> Bio Verde. Todos os direitos reservados.</p>
                        </div>
                    </div>
                </body>
                </html>
        ";

    return sendEmail(
        null,
        $email,
        'Bio Verde - Cadastro de cliente realizado com sucesso!',
        $html
    );
}

// listar_clientes.php

function buscarClientes($conn)
{

    $result = $conn->query("
        SELECT 
            cliente_id,
            cliente_nome,
            cliente_email,
            cliente_telefone,
            cliente_cpf_cnpj,
            cliente_cep,
            cliente_endereco,
            cliente_numendereco,
            cliente_estado,
            cliente_cidade,
            b.sta_nome,
            cliente_observacoes,
            cliente_data_cadastro,
            pedido_id
        FROM clientes a
        INNER JOIN status b ON a.status = b.sta_id;
        ");

    if (!$result) {
        throw new Exception("Erro ao buscar usuários: " . $conn->error);
    }

    $fornecedores = [];
    while ($row = $result->fetch_assoc()) {
        $fornecedores[] = $row;
    }

    return $fornecedores;
}

// filtro.cliente.php

function construirFiltrosCliente($data)
{
    $mapaFiltros = [
        "fnome_cliente" => "cliente_nome",
        "fcpf_cnpj" => "cliente_cpf_cnpj",
        "ftel" => "cliente_telefone",
        "fcidade" => "cliente_cidade",
        "festado" => "cliente_estado",
        "fdataCadastro" => "cliente_data_cadastro",
        "fstatus" => "status",
    ];

    $where = [];
    $valores = [];
    $tipos = "";

    foreach ($mapaFiltros as $param => $coluna) {
        if (!empty($data[$param])) {
            // Verifica se o filtro é do tipo "like" (para nome, por exemplo)
            if (in_array($param, ["fnome_cliente", "fcidade", "festado"])) {
                $where[] = "LOWER($coluna) LIKE LOWER(?)";
                $valores[] = '%' . trim($data[$param]) . '%';
                $tipos .= "s";
            } else {
                $where[] = "$coluna = ?";
                $valores[] = trim($data[$param]);
                $tipos .= "s";
            }
        }
    }

    return [
        'where' => $where,
        'valores' => $valores,
        'tipos' => $tipos
    ];
}


function buscarClientesComFiltros($conn, $filtros)
{

    $sql = "SELECT cliente_id, cliente_nome, cliente_email, cliente_telefone, cliente_cpf_cnpj, cliente_cep, cliente_endereco, cliente_numendereco, cliente_estado, cliente_cidade,";
    $sql .= " b.sta_nome, cliente_data_cadastro, pedido_id, cliente_observacoes";
    $sql .= " FROM clientes a";
    $sql .= " LEFT JOIN status b ON a.status = b.sta_id";

    if (!empty($filtros['where'])) {
        // Modificar as condições que envolvem fornecedor_dtcadastro
        $modifiedWhere = [];
        foreach ($filtros['where'] as $condition) {
            if (strpos($condition, 'cliente_data_cadastro') !== false) {
                // Substituir cliente_data_cadastro por DATE(cliente_data_cadastro)
                $condition = preg_replace('/cliente_data_cadastro\s*(=|!=|>|<|>=|<=|LIKE)/', 'DATE(cliente_data_cadastro) $1', $condition);
            }
            $modifiedWhere[] = $condition;
        }
        $sql .= " WHERE " . implode(" AND ", $modifiedWhere);
    }

    $stmt = $conn->prepare($sql);

    if (!empty($filtros['valores'])) {
        $stmt->bind_param($filtros['tipos'], ...$filtros['valores']);
    }

    $stmt->execute();
    $result = $stmt->get_result();
    $clientes = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    return $clientes;
}

// editar.cliente.php

function verifyExist($conn, $id, $pk, $tabela){
    $stmt = $conn->prepare('SELECT ' . $pk . ' FROM ' . $tabela . ' WHERE ' . $pk . ' = ?');
    if (!$stmt) {
        return ["success" => false, "message" => "Erro ao preparar consulta: " . $conn->error];
    }
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $existe = $result->num_rows > 0;
    $stmt->close();
    return $existe;
}

function buscarClientePorId($conn, $cliente_id)
{
    $stmt = $conn->prepare("
        SELECT 
            c.cliente_id,
            c.cliente_nome,
            c.cliente_email,
            c.cliente_telefone,
            c.cliente_cpf_cnpj,
            c.status,              
            s.sta_id,             
            s.sta_nome,            
            c.cliente_cep,
            c.cliente_endereco,
            c.cliente_numendereco,
            c.cliente_estado,
            c.cliente_cidade,
            c.cliente_observacoes,
            c.cliente_data_cadastro
        FROM clientes c
        LEFT JOIN status s ON c.status = s.sta_id
        WHERE c.cliente_id = ?
    ");

    if (!$stmt) {
        error_log("Erro ao preparar consulta: " . $conn->error);
        return null;
    }

    $stmt->bind_param("i", $cliente_id);

    if (!$stmt->execute()) {
        error_log("Erro ao executar consulta: " . $stmt->error);
        $stmt->close();
        return null;
    }

    $result = $stmt->get_result();
    $dados = $result->fetch_assoc();
    $stmt->close();

    // Log para depuração
    error_log("Dados do cliente retornados: " . print_r($dados, true));

    return $dados;
}

// excluir.cliente.php

?>