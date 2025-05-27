<?php
/**************** HEADERS ************************/
include_once("../inc/funcoes.inc.php");
session_start();
header_remove('X-Powered-By');
header('Content-Type: application/json; charset=UTF-8');
/*************************************************/

/**************** VERIFICA CONEXÃO COM O BANCO ************************/
if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Erro na conexão com o banco de dados: " . $conn->connect_error]));
}
/*********************************************************************/

/**************** RECEBE AS INFORMAÇÕES DO FRONT-END ************************/
$rawData = file_get_contents("php://input");

if (empty($rawData)) {
    echo json_encode(["success" => false, "message" => "Nenhum dado recebido."]);
    exit;
}

$data = json_decode($rawData, true);
/***************************************************************************/

/**************** VALIDAÇÕES ************************/
if (empty($data) || !isset($data["email"])) {
    echo json_encode(["success" => false, "message" => "E-mail não informado ou erro ao decodificar JSON"]);
    exit;
}

$email = $conn->real_escape_string($data["email"]);
/****************************************************/

/**************** VERIFICAR SE O EMAIL EXISTE ************************/
if (!verificarEmailExiste($conn, $email)) {
    echo json_encode(["success" => false, "message" => "E-mail não cadastrado."]);
    salvarLog("Um usuário com e-mail: $email tentou recuperar a senha para o e-mail não cadastrado: " . $email, Acoes::RECUPERAR_SENHA, "erro");
    exit;
}

$sql = "UPDATE usuarios SET codigo_recuperacao_expira_em = NULL WHERE user_email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
/********************************************************************/

/**************** ARMAZENAR AS INFORMAÇÕES NA SESSÃO ************************/
$_SESSION['email_recuperacao'] = $email;
$_SESSION['expire_time'] = time() + 600;
/****************************************************************************/

/**************** GERAR CÓDIGO DE RECUPERAÇÃO ************************/
$codigo = gerarCodigoRecuperacao();
/*********************************************************************/

if (!atualizarCodigoRecuperacao($conn, $email, $codigo)) {
    echo json_encode(["success" => false, "message" => "Erro ao gerar código de recuperação"]);
    salvarLog("Falha ao atualizar código de recuperação para o e-mail: " . $email . " \n\nErro: $conn->error", Acoes::RECUPERAR_SENHA, "erro");

    exit;
}

/**************** ENVIAR E-MAIL COM O CÓDIGO ************************/
$resultadoEmail = enviarEmailRecuperacao($email, $codigo);

if ($resultadoEmail !== true) {
    echo json_encode($resultadoEmail);
    exit;
}
/********************************************************************/

echo json_encode([
    "success" => true,
    "message" => "Código enviado para seu e-mail!",
    "email" => $email,
    "session_id" => session_id()
]);

salvarLog("O usuário com o e-mail $email recuperou a senha.", Acoes::RECUPERAR_SENHA);

$conn->close();