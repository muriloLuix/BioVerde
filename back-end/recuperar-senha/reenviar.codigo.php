<?php
include_once "../inc/funcoes.inc.php";

session_start();
header_remove('X-Powered-By');
header('Content-Type: application/json; charset=UTF-8');

$email = $_SESSION['email_recuperacao'] ?? null;

if (!$email) {
    salvarLog("Tentativa de reenvio de código sem e-mail na sessão", Acoes::REENVIAR_CODIGO, "erro");

    echo json_encode(["success" => false, "message" => "Erro: Nenhum e-mail encontrado na sessão."]);
    exit;
}

// Verificar conexão com o banco de dados
if ($conn->connect_error) {
    salvarLog("Erro na conexão com o banco de dados: " . $conn->connect_error, Acoes::REENVIAR_CODIGO, "erro");

    echo json_encode(["success" => false, "message" => "Erro na conexão com o banco de dados."]);
    exit;
}

// Verificar se o email existe no banco de dados
if (!verificarEmailExiste($conn, $email)) {
    salvarLog("Tentativa de reenvio para e-mail não cadastrado: " . $email, Acoes::REENVIAR_CODIGO, "erro");

    echo json_encode(["success" => false, "message" => "E-mail não cadastrado."]);
    exit;
}

// Gerar novo código de recuperação
$codigo = gerarCodigoRecuperacao();

// Atualizar código no banco de dados com tempo de expiração
$update_sql = "UPDATE usuarios SET codigo_recuperacao = ?, codigo_recuperacao_expira_em = DATE_ADD(NOW(), INTERVAL 30 MINUTE) WHERE user_email = ?";
$update_stmt = $conn->prepare($update_sql);

if (!$update_stmt) {
    salvarLog("Erro ao preparar atualização de código: " . $conn->error, Acoes::REENVIAR_CODIGO, "erro");

    echo json_encode(["success" => false, "message" => "Erro interno ao gerar o código de recuperação."]);
    exit;
}

$update_stmt->bind_param("ss", $codigo, $email);
$update_stmt->execute();
$update_stmt->close();

// Enviar e-mail com o novo código
$resultadoEmail = enviarEmailRecuperacao($email, $codigo);

if ($resultadoEmail !== true) {
    salvarLog("Erro ao enviar e-mail de reenvio para: " . $email, Acoes::REENVIAR_CODIGO, "erro");

    echo json_encode($resultadoEmail);
    exit;
}

// Log e resposta de sucesso
salvarLog("Código de recuperação reenviado para: " . $email, Acoes::REENVIAR_CODIGO);

echo json_encode([
    "success" => true, 
    "message" => "E-mail de recuperação reenviado!", 
    "email" => $email,
    "session_id" => session_id()
]);

$conn->close();
exit;