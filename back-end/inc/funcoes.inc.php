<?php

include("../cors.php");
include("ambiente.inc.php");
include("../log/log.php");

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../../vendor/phpmailer/phpmailer/src/Exception.php';
require '../../vendor/phpmailer/phpmailer/src/PHPMailer.php';
require '../../vendor/phpmailer/phpmailer/src/SMTP.php';
require '../../vendor/autoload.php';

// cadastrar.usuario.php

function validarCampos($data, $requiredFields) {
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            return ["success" => false, "message" => "O campo " . $field . " é obrigatório."];
        }
    }
    return null;
}

function verificarCargo($conn, $cargo) {
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

function verificarNivel($conn, $nivel) {
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

function verificarEmailCpf($conn, $email, $cpf) {
    $stmt = $conn->prepare("SELECT user_email, user_CPF FROM usuarios WHERE user_email = ? OR user_CPF = ?");
    if (!$stmt) {
        return ["success" => false, "message" => "Erro ao preparar a query: " . $conn->error];
    }
    $stmt->bind_param("ss", $email, $cpf);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        return ["success" => false, "message" => "E-mail ou CPF já existe."];
    }
    return null;
}

function verificarStatus($conn, $status) {
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


function enviarEmailCadastro($email, $data) {
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'bioverdesistema@gmail.com';
        $mail->Password   = 'gfdx wwpr cnfi emjt';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        $mail->setFrom('bioverdesistema@gmail.com', 'Bio Verde');
        $mail->addAddress($email);

        $mail->isHTML(true);
        $mail->CharSet = 'UTF-8';
        $mail->Subject = 'Bio Verde - Cadastro no Sistema';
        $mail->Body = "
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
                            <p style='color: #2e7d32; font-size: 18px;'><strong>Email:</strong> ".$data['email']."</p>
                            <p style='color: #2e7d32; font-size: 18px;'><strong>Senha:</strong> ".$data['password']."</p>
                        </div>
                        <p style='font-size: 18px; line-height: 1.6;'>Por questões de segurança, recomendamos que você altere sua senha ao acessar o sistema pela primeira vez.</p>
                        <p style='font-size: 18px; line-height: 1.6;'>Sua senha está protegida por criptografia de ponta a ponta, garantindo total privacidade e segurança.</p>
                        <p style='font-size: 16px; color: #777777; margin-top: 20px;'>Se precisar de ajuda, entre em contato com nosso suporte.</p>
                        <p style='font-size: 16px; color: #777777; margin-top: 20px;'>Atenciosamente,<br>Equipe Bio Verde</p>
                    </div>
                    <div style='background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; color: #777777;'>
                        <p style='margin: 0;'>Este é um e-mail automático. Não é necessário respondê-lo.</p>
                        <p style='margin: 5px 0 0;'>&copy; " . date('Y') . " Bio Verde. Todos os direitos reservados.</p>
                    </div>
                </div>
            </body>
            </html>
        ";
        $mail->AltBody = "Bem-vindo à Bio Verde!\n\nSeu cadastro foi concluído com sucesso.\n\nSeus dados de acesso:\nEmail: ".$data['email']."\nSenha: ".$data['password']."\n\nPor segurança, recomendamos alterar sua senha no primeiro acesso.\n\nAtenciosamente,\nEquipe Bio Verde\n\nEste é um e-mail automático. Não responda.";
        $mail->send();
        return true;
    } catch (Exception $e) {
        return ["success" => false, "message" => "Erro ao enviar e-mail: " . $mail->ErrorInfo];
    }
}

// listar_usuarios.php e listar_opcoes.php

function buscarCargos($conn) {
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

function buscarNiveisAcesso($conn) {
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

function buscarStatus($conn) {
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
// listar_usuarios.php

function buscarUsuarios($conn) {
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

function verificarSenhaAtual($conn, $email, $novaSenha) {
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

function atualizarSenha($conn, $email, $novaSenha) {
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


function gerarCodigoRecuperacao($tamanho = 6) {
    $alfabeto = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $codigo = '';
    for ($i = 0; $i < $tamanho; $i++) {
        $codigo .= $alfabeto[rand(0, strlen($alfabeto) - 1)];
    }
    return $codigo;
}

function enviarEmailRecuperacao($email, $codigo) {
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'bioverdesistema@gmail.com';
        $mail->Password   = 'gfdx wwpr cnfi emjt';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        $mail->setFrom('bioverdesistema@gmail.com', 'Bio Verde');
        $mail->addAddress($email);

        $mail->isHTML(true);
        $mail->CharSet = 'UTF-8';
        $mail->Subject = 'Bio Verde - Código de Recuperação';
        $mail->Body = "
        <html>
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
        </html>
        ";

        $mail->AltBody = "Seu código de recuperação é: {$codigo}";
        $mail->send();
        return true;
    } catch (Exception $e) {
        return ["success" => false, "message" => "Erro ao enviar e-mail: " . $mail->ErrorInfo];
    }
}

function verificarEmailExiste($conn, $email) {
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

function atualizarCodigoRecuperacao($conn, $email, $codigo) {
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

function verificarCodigoRecuperacao($conn, $codigo) {

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

function verificarCredenciais($conn, $email, $password) {
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

function configurarSessaoSegura() {
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
function construirFiltrosUsuarios($data) {
    $mapaFiltros = [
        "fname"  => "user_nome",   
        "femail" => "user_email", 
        "ftel"   => "user_telefone",
        "fcpf"   => "user_CPF",
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

function buscarUsuariosComFiltros($conn, $filtros) {
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
 * Verifica se o usuário existe
 */
function verificarUsuarioExiste($conn, $user_id) {
    $stmt = $conn->prepare("SELECT user_id FROM usuarios WHERE user_id = ?");
    if (!$stmt) {
        return ["success" => false, "message" => "Erro ao preparar consulta: " . $conn->error];
    }
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $existe = $result->num_rows > 0;
    $stmt->close();
    return $existe;
}

/**
 * Atualiza os dados do usuário
 */
function atualizarUsuario($conn, $user_id, $dados) {
    // Campos básicos
    $campos = [
        'user_nome' => $dados['name'],
        'user_email' => $dados['email'],
        'user_telefone' => $dados['tel'],
        'user_CPF' => $dados['cpf'],
        'car_id' => verificarCargo($conn, $dados['cargo']),
        'nivel_id' => verificarNivel($conn, $dados['nivel']),
        'sta_id' => $dados['sta_id'] ?? null
    ];
    
    
    // Se houver senha, atualiza também
    if (!empty($dados['password'])) {
        $campos['user_senha'] = password_hash($dados['password'], PASSWORD_DEFAULT);
    }
    
    // Prepara os campos para a query
    $sets = [];
    $tipos = '';
    $valores = [];
    
    foreach ($campos as $campo => $valor) {
        if ($valor !== null) {
            $sets[] = "$campo = ?";
            $tipos .= is_int($valor) ? 'i' : 's';
            $valores[] = $valor;
        }
    }
    
    // Adiciona o user_id no final
    $valores[] = $user_id;
    $tipos .= 'i';
    
    $sql = "UPDATE usuarios SET " . implode(', ', $sets) . " WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        return ["success" => false, "message" => "Erro ao preparar atualização: " . $conn->error];
    }
    
    $stmt->bind_param($tipos, ...$valores);
    $stmt->execute();
    
    if ($stmt->affected_rows > 0 || $stmt->affected_rows == 0) {
        // Considera sucesso mesmo se nada foi alterado (valores iguais)
        return ["success" => true];
    } else {
        return ["success" => false, "message" => "Nenhum registro atualizado."];
    }
}

/**
 * Verifica conflitos de email/CPF (excluindo o próprio usuário)
 */
function verificarConflitosAtualizacao($conn, $email, $cpf, $user_id) {
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
function obterIdStatusPorNome($conn, $nomeStatus) {
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

function buscarUsuarioPorId($conn, $user_id) {
    $stmt = $conn->prepare("
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

function registrarExclusaoUsuario($conn, $user_id, $dados) {
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

function deletarUsuario($conn, $user_id) {
    $stmt = $conn->prepare("DELETE FROM usuarios WHERE user_id = ?");
    
    if (!$stmt) {
        return [
            'success' => false,
            'message' => 'Falha ao preparar a exclusão'
        ];
    }

    $stmt->bind_param('i', $user_id);
    
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

?>

