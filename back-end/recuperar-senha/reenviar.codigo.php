<?php
/**************** HEADERS ************************/
include_once "../inc/funcoes.inc.php";
session_start();
header_remove('X-Powered-By');
header('Content-Type: application/json; charset=UTF-8');
$email = $_SESSION['email_recuperacao'] ?? null;
/*************************************************/

/**************** VERIFICA SE O EMAIL EXISTE ************************/
if (!$email) {
    echo json_encode(["success" => false, "message" => "Erro: Nenhum e-mail encontrado na sessão."]);
    salvarLog("Tentativa de reenvio de código sem e-mail na sessão", Acoes::REENVIAR_CODIGO, "erro");
    exit;
}
/*******************************************************************/

/**************** VERIFICA A CONEXÃO COM O BANCO ************************/
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Erro na conexão com o banco de dados."]);
    exit;
}
/*********************************************************************/

/**************** VERIFICAR SE O EMAIL EXISTE NO BD ************************/
if (!verificarEmailExiste($conn, $email)) {
    echo json_encode(["success" => false, "message" => "E-mail não cadastrado."]);
    salvarLog("O usuário com o e-mail $email tentou reenviar o código de recuperação para o e-mail nao cadastrado.", Acoes::REENVIAR_CODIGO, "erro");
    exit;
}
/*********************************************************************/

/**************** GERAR CÓDIGO DE RECUPERAÇÃO ************************/
$codigo = gerarCodigoRecuperacao();
/*********************************************************************/

/**************** ATUALIZAR CÓDIGO NO BANCO DE DADOS ************************/
$update_sql = "UPDATE usuarios SET codigo_recuperacao = ?, codigo_recuperacao_expira_em = DATE_ADD(NOW(), INTERVAL 30 MINUTE) WHERE user_email = ?";
$update_stmt = $conn->prepare($update_sql);

if (!$update_stmt) {
    echo json_encode(["success" => false, "message" => "Erro interno ao gerar o código de recuperação."]);
    exit;
}

$update_stmt->bind_param("ss", $codigo, $email);
$update_stmt->execute();
$update_stmt->close();
/**************************************************************************/

/**************** ENVIAR E-MAIL COM O NOVO CÓDIGO ************************/
$resultadoEmail = enviarEmailRecuperacao($email, $codigo);

if ($resultadoEmail !== true) {
    echo json_encode($resultadoEmail);
    exit;
}
/************************************************************************/

salvarLog("Código de recuperação reenviado para o e-mail: " . $email, Acoes::REENVIAR_CODIGO);

echo json_encode([
    "success" => true,
    "message" => "E-mail de recuperação reenviado!",
    "email" => $email,
    "session_id" => session_id()
]);

$conn->close();
exit;