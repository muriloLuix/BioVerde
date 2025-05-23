<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include("../cors.php");
include("ambiente.inc.php");
include("../log/log.php");
include("../config/acoes.php");
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
    $stmt = $conn->prepare("SELECT staproduto_id FROM status_produto WHERE staproduto_id = ?");
    if (!$stmt) {
        return null;
    }

    $status = (int)$status; 
    $stmt->bind_param("i", $status);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        return null;
    }

    $row = $result->fetch_assoc();
    $stmt->close();
    return $row['staproduto_id'];
}


/**
 * Verifica se o tipo existe e retorna o ID do tipo.
 * @param mysqli $conn conex o ao banco de dados
 * @param string $tipo nome do tipo a ser verificado
 * @return int|null retorna o ID do tipo ou null se houver erro na query ou se o tipo não existir
 */
function verificarTipo($conn, $tipo)
{
    $stmt = $conn->prepare("SELECT tproduto_id FROM tp_produto WHERE tproduto_id = ?");
    if (!$stmt) {
        return null; // Retorna null em caso de erro na query
    }

    $tipo = (int)$tipo;
    $stmt->bind_param("i", $tipo);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        return null; // Retorna null quando tipo não existe
    }

    $row = $result->fetch_assoc();
    $stmt->close();
    return $row['tproduto_id']; // Retorna apenas o ID
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


function buscarStatusPedido($conn)
{
    $result = $conn->query("SELECT stapedido_id, stapedido_nome FROM status_pedido");
    if (!$result) {
        throw new Exception("Erro ao buscar status: " . $conn->error);
    }

    $statusPedido = [];
    while ($row = $result->fetch_assoc()) {
        $statusPedido[] = $row;
    }

    return $statusPedido;
}

/**
 * Busca todos os status do produto registrados no banco de dados.
 *
 * @param mysqli $conn Conex o com o banco de dados.
 *
 * @return array Retorna um array com os status do produto, onde cada status
 *         é representado por um array com as chaves 'staproduto_id' e 'staproduto_nome'.
 *
 * @throws Exception Caso ocorra um erro ao buscar os status.
 */
function buscarStatus($conn)
{
    $result = $conn->query("SELECT staproduto_id, staproduto_nome FROM status_produto");
    if (!$result) {
        throw new Exception("Erro ao buscar status: " . $conn->error);
    }

    $status_produto = [];
    while ($row = $result->fetch_assoc()) {
        $status_produto[] = $row;
    }

    return $status_produto;
}

function buscarProdutos($conn)
{
    $result = $conn->query("SELECT produto_id, produto_nome FROM produtos");
    if (!$result) {
        throw new Exception("Erro ao buscar status: " . $conn->error);
    }

    $produtos = [];
    while ($row = $result->fetch_assoc()) {
        $produtos[] = $row;
    }

    return $produtos;
}

function buscarFornecedores($conn)
{
    $result = $conn->query("SELECT fornecedor_id, fornecedor_nome_ou_empresa FROM fornecedores");
    if (!$result) {
        throw new Exception("Erro ao buscar fornecedor: " . $conn->error);
    }

    $fornecedores = [];
    while ($row = $result->fetch_assoc()) {
        $fornecedores[] = $row;
    }

    return $fornecedores;
}

function unidMedida($conn)
{
    $result = $conn->query("SELECT uni_id, uni_sigla FROM unidade_medida");
    if (!$result) {
        throw new Exception("Erro ao buscar unidade de medida: " . $conn->error);
    }

    $unidade_medida = [];
    while ($row = $result->fetch_assoc()) {
        $unidade_medida[] = $row;
    }

    return $unidade_medida;
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

function buscarTipoProduto($conn){
    $result = $conn->query("SELECT tproduto_id, tproduto_nome FROM tp_produto");
    if (!$result) {
        throw new Exception("Erro ao buscar o tipo do produto: " . $conn->error);
    }

    $tproduto_id = [];
    while ($row = $result->fetch_assoc()) {
        $tproduto_id[] = $row;
    }

    return $tproduto_id;
}

function buscarUnidadeMedida($conn){
    $result = $conn->query("SELECT uni_id, uni_sigla FROM unidade_medida");
    if (!$result) {
        throw new Exception("Erro ao buscar a unidade de medida: " . $conn->error);
    }

    $unidade_medida = [];
    while ($row = $result->fetch_assoc()) {
        $unidade_medida[] = $row;
    }

    return $unidade_medida;
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

/**
 * Verifica se um registro existe na base de dados.
 * 
 * @param mysqli $conn conexao com o banco de dados
 * @param int $id ID do registro a ser verificado
 * @param string $pk nome da chave primaria da tabela
 * @param string $tabela nome da tabela que contem o registro
 * 
 * @return bool retorna true se o registro existir, false caso contrario
 */
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

/**
 * Busca dados em uma tabela do banco de dados.
 * 
 * @param mysqli $conn conex o com o banco de dados
 * @param string $table nome da tabela que cont m os dados a serem buscados
 * @param string $fields campos a serem buscados na tabela (separados por v rgula)
 * @param array $inner par metros de inner join (opcional)
 *                      - join_table: nome da tabela a ser feita a inner join
 *                      - on: condicional da inner join
 * 
 * @return array retorna um array com os dados encontrados
 * @throws Exception caso haja erro ao buscar os dados
 */
function search($conn, $table, $fields, $joins = []) {
    $sql = "SELECT $fields FROM $table";

    if (!empty($joins) && is_array($joins)) {
        foreach ($joins as $join) {
            if (isset($join['type'], $join['join_table'], $join['on'])) {
                $sql .= " {$join['type']} JOIN {$join['join_table']} ON {$join['on']}";
            }
        }
    }

    $result = $conn->query($sql);

    if (!$result) {
        throw new Exception("Erro ao buscar dados: " . $conn->error);
    }

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    return $data;
}

/**
 * Busca um usuário pelo seu ID
 * 
 * @param mysqli $conn Conex o com o banco de dados
 * @param int $user_id ID do usu rio a ser buscado
 * 
 * @return array|null Associativo com os dados do usu rio, ou null se n o encontrado
 */
function searchPersonPerID($conn, $id, $table, $fields, $joins = [], $id_field = 'user_id') {
    $sql = "SELECT $fields FROM $table";

    if (!empty($joins) && is_array($joins)) {
        foreach ($joins as $join) {
            if (isset($join['type'], $join['join_table'], $join['on'])) {
                $sql .= " {$join['type']} JOIN {$join['join_table']} ON {$join['on']}";
            }
        }
    }

    $sql .= " WHERE $id_field = ?";


    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        return ["success" => false, "message" => "Erro no prepare: " . $conn->error];
    }

    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    return $result->fetch_assoc();
}

/**
 * Executa uma consulta com base em um array de parâmetros.
 *
 * @param mysqli $conn Conex o com o banco de dados.
 * @param array $base Array com as informações da consulta base.
 *      - select: Campos a serem consultados.
 *      - from: Tabela a ser consultada.
 *      - joins: Array de JOINs a serem aplicados (opcional).
 *          - type: Tipo do JOIN (INNER, LEFT, RIGHT).
 *          - join_table: Tabela a ser JOINada.
 *          - on: Condi o para o JOIN.
 *      - modificadores: Array com modifica es específicas para cada campo
 *          (opcional).
 * @param array $filtros Array com as informações de filtragem.
 *      - where: Condi es WHERE a serem aplicadas (opcional).
 *      - valores: Valores a serem bindados para a consulta (opcional).
 *      - tipos: Tipos dos valores a serem bindados (opcional).
 *
 * @return array|null Retorna um array com os registros encontrados, ou null se n o encontrado.
 */
function findFilters($conn, array $base, array $filtros)
{
    $sql = "SELECT {$base['select']} FROM {$base['from']}";

    // Aplica JOINs se existirem
    if (!empty($base['joins'])) {
        foreach ($base['joins'] as $join) {
            $sql .= " $join";
        }
    }

    // Aplica cláusulas WHERE com modificações específicas
    if (!empty($filtros['where'])) {
        $modifiedWhere = [];

        foreach ($filtros['where'] as $condition) {
            if (!empty($base['modificadores'])) {
                foreach ($base['modificadores'] as $coluna => $modificador) {
                    if (strpos($condition, $coluna) !== false) {
                        $condition = preg_replace("/\b$coluna\b\s*(=|!=|>|<|>=|<=|LIKE)/", "$modificador $1", $condition);
                    }
                }
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
    $registros = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    return $registros;
}

/**
 * Gera um array com informações para filtrar uma consulta com base em um array de parâmetros.
 *
 * @param array $data Array com os parâmetros a serem filtrados.
 * @param array $mapaFiltros Array que mapeia cada parâmetro com sua configura o de filtragem.
 *      - string: Coluna a ser filtrada.
 *      - array: Array com configura o avançada de filtragem.
 *          - coluna: Coluna a ser filtrada.
 *          - tipo: Tipo de filtragem (igual ou like).
 *
 * @return array Array com as informações de filtragem.
 *      - where: Array com as condi es WHERE a serem aplicadas.
 *      - valores: Array com os valores a serem bindados para a consulta.
 *      - tipos: String com os tipos dos valores a serem bindados.
 */
function buildFilters(array $data, array $mapaFiltros)
{
    $where = [];
    $valores = [];
    $tipos = "";

    foreach ($mapaFiltros as $param => $config) {
        // Suporte para config como string (modo simples) ou array (modo avançado)
        if (is_string($config)) {
            $coluna = $config;
            $tipoFiltro = 'igual'; // padrão
        } else {
            $coluna = $config['coluna'];
            $tipoFiltro = $config['tipo'] ?? 'igual'; // igual ou like
        }

        if (!empty($data[$param])) {
            if ($tipoFiltro === 'like') {
                $where[] = "LOWER($coluna) LIKE LOWER(?)";
                $valores[] = '%' . trim($data[$param]) . '%';
            } else {
                $where[] = "$coluna = ?";
                $valores[] = trim($data[$param]);
            }
            $tipos .= "s"; // Adapte se precisar de outros tipos além de string
        }
    }

    return [
        'where' => $where,
        'valores' => $valores,
        'tipos' => $tipos
    ];
}

/**
 * Verifica se um registro existe na base de dados com base em dois valores.
 * 
 * @param mysqli $conn Conex o com o banco de dados
 * @param string $valor1 Valor a ser verificado na primeira coluna
 * @param string $valor2 Valor a ser verificado na segunda coluna (opcional)
 * @param string $tabela Nome da tabela que cont m o registro
 * @param string $coluna1 Nome da primeira coluna a ser verificada
 * @param string $coluna2 Nome da segunda coluna a ser verificada (opcional)
 * 
 * @return array|null Retorna um array com uma mensagem de erro se o registro for encontrado, ou null se n o houver registro.
 */
function verifyCredentials($conn, $tabela, $valor1, $coluna1, $valor2 = null, $coluna2 = null) {
    if ($valor2 !== null && $coluna2 !== null) {
        $sql = "SELECT * FROM $tabela WHERE $coluna1 = ? OR $coluna2 = ?";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            return ["success" => false, "message" => "Erro ao preparar a query: " . $conn->error];
        }
        $stmt->bind_param('ss', $valor1, $valor2);
    } else {
        $sql = "SELECT * FROM $tabela WHERE $coluna1 = ?";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            return ["success" => false, "message" => "Erro ao preparar a query: " . $conn->error];
        }
        $stmt->bind_param('s', $valor1);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        if ($valor2 !== null && $coluna2 !== null) {
            return ["success" => false, "message" => "O registro " . $valor1 . " e/ou " . $valor2 . " já existe no sistema."];
        } else {
            return ["success" => false, "message" => "O registro " . $valor1 . " já existe no sistema."];
        }
    }

    return null;
}

function checkLoggedUser($conn, $sessionUserId) {
    header('Content-Type: application/json');

    // 1) Sem sessão => 401
    if (!$sessionUserId) {
        http_response_code(401);
        echo json_encode([
            "loggedIn" => false,
            "message"  => "Usuário não logado."
        ]);
        exit;
    }

    // 2) Checa flag de forced logout
    $stmt = $conn->prepare("SELECT force_logout FROM usuarios WHERE user_id = ?");
    $stmt->bind_param("i", $sessionUserId);
    $stmt->execute();
    $stmt->bind_result($flag);
    $stmt->fetch();
    $stmt->close();

    if ($flag) {
        // Reseta o flag para não ficar em loop
        $upd = $conn->prepare("UPDATE usuarios SET force_logout = 0 WHERE user_id = ?");
        $upd->bind_param("i", $sessionUserId);
        $upd->execute();
        $upd->close();

        // Destroi sessão atual
        session_unset();
        session_destroy();

        // Retorna 401 forçando re-login
        http_response_code(401);
        echo json_encode([
            "loggedIn" => false,
            "message"  => "Sua sessão expirou devido a alteração de permissões. Por favor, faça o login novamente."
        ]);
        exit;
    }

    // 3) Se chegar aqui, está tudo OK – continue normalmente
}




/******************************************************************************/

// listar_usuarios.php

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

// editar.usuario.php

/*
 * Verifica conflitos de email/CPF/CNPJ
 */
function verificarConflitosAtualizacao($conn, $tabela, $colunas, $valores, $chavePrimaria, $idIgnorar)
{
    // Validação básica dos parâmetros
    if (count($colunas) !== count($valores)) {
        return ["success" => false, "message" => "Número de colunas e valores não correspondem."];
    }

    // Monta a cláusula WHERE dinamicamente
    $condicoes = [];
    $tipos = "";
    $params = [];

    foreach ($colunas as $i => $coluna) {
        $condicoes[] = "$coluna = ?";
        $tipos .= "s";
        $params[] = $valores[$i];
    }

    $whereClause = implode(" OR ", $condicoes);
    $whereClause = "($whereClause) AND $chavePrimaria != ?";

    $tipos .= "i";
    $params[] = $idIgnorar;

    $query = "SELECT $chavePrimaria FROM $tabela WHERE $whereClause";

    $stmt = $conn->prepare($query);
    if (!$stmt) {
        return ["success" => false, "message" => "Erro ao preparar consulta: " . $conn->error];
    }

    // Usa o operador splat (...) para passar os parâmetros dinamicamente
    $stmt->bind_param($tipos, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        return ["success" => false, "message" => "Um dos valores já está em uso por outro registro."];
    }

    return null;
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
                                <p style='color: #2e7d32; font-size: 18px;'><strong>Nome da Empresa/Fornecedor: </strong> " . $data['nome_empresa_fornecedor'] . "</p>
                                <p style='color: #2e7d32; font-size: 18px;'><strong>Razão Social: </strong> " . $data['razao_social'] . "</p>
                                <p style='color: #2e7d32; font-size: 18px;'><strong>E-mail: </strong> " . $data['email'] . "</p>
                                <p style='color: #2e7d32; font-size: 18px;'><strong>CPF/CNPJ: </strong> " . $data['cpf_cnpj'] . "</p>
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

// cadastrar_clientes.php

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
                                <p style='color: #2e7d32; font-size: 18px;'><strong>Nome do Cliente/Empresa: </strong> " . $data['nome_empresa_cliente'] . "</p>
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
// filtro.cliente.php

/**
 * Verifica se o usuário logado tem pelo menos o nível mínimo.
 * Retorna HTTP 403 se não autorizado.
 *
 * @param int $nivelMinimo
 */
function authorize(int $nivelMinimo): void {
    if (!isset($_SESSION['nivel_acesso']) || $_SESSION['nivel_acesso'] < $nivelMinimo) {
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode([
            "success" => false
        ]);
        exit;
    }
}
/**
 * Retorna o nível mínimo exigido para o recurso, ou null se não definido.
 *
 * @param string $recurso
 * @return int|null
 */
function getMinLevelFor(string $recurso): ?int {

    $sql = "SELECT nivel_minimo FROM permissoes WHERE recurso = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        return null;
    }
    $stmt->bind_param('s', $recurso);
    $stmt->execute();
    $stmt->bind_result($nivelMinimo);

    $result = null;
    if ($stmt->fetch()) {
        $result = (int)$nivelMinimo;
    }
    $stmt->close();
    return $result;
}


/**
 * Mapeamento estático de dependências de chave-primária → [ tabela_referente => coluna_fk, … ]
 */
function getDependencyMap(): array {
    return [
        'lotes' => [              // quando for excluir de lotes:
            'produtos'     => 'lote_id',
            'movimentacoes'=> 'lote_id',
        ],
        'fornecedores' => [
            'produtos'     => 'id_fornecedor',
        ],
        'usuarios' => [
            'pedidos'      => 'user_id',
            'logs'         => 'usuario_id',
        ],
        // … adicione conforme suas outras entidades
    ];
}

/**
 * Verifica se o registro $id em $table/$pkField está sendo referenciado
 * em alguma tabela definida no getDependencyMap.
 *
 * @return array ['success'=>bool, 'message'=>string]
 */
function checkDependencies(mysqli $conn, string $table, string $pkField, int $id): array {
    $map = getDependencyMap();

    if (!isset($map[$table])) {
        // Nenhuma dependência configurada → pode excluir
        return ['success' => true, 'message' => ''];
    }

    foreach ($map[$table] as $depTable => $depFkColumn) {
        $sql = "SELECT 1
                  FROM `{$depTable}`
                 WHERE `{$depFkColumn}` = ?
                 LIMIT 1";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $stmt->store_result();
        if ($stmt->num_rows > 0) {
            return [
                'success' => false,
                'message' => "Não é possível excluir. Existem registros em “{$depTable}” relacionados a este {$table}."
            ];
        }
    }

    return ['success' => true, 'message' => ''];
}



?>