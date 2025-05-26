<?php
/**************** HEADERS ************************/
session_start();
include_once "../inc/funcoes.inc.php";
if (!function_exists('salvarLog')) {
    include_once '../log/log.php';
}
header('Content-Type: application/json');
/*************************************************/

/**************** VERIFICA CONEXÃO COM O BANCO ************************/
if ($conn->connect_error) {
    error_log("Erro de conexão com o banco: " . $conn->connect_error);
    die(json_encode([
        "success" => false,
        "message" => "Erro no servidor. Por favor, tente novamente mais tarde."
    ]));
}
/*********************************************************************/

/**************** TEMPO DE EXPIRAÇÃO ************************/
if (isset($_SESSION['expire_time']) && time() > $_SESSION['expire_time']) {
    session_unset();
    session_destroy();
    echo json_encode(["success" => false, "message" => "Sessão expirada. Por favor, inicie o processo novamente."]);
    exit;
}
/*********************************************************/

/**************** VEIFICAR SE O E-MAIL DA RECUPERAÇÃO ESTÁ SALVO NA SESSÃO ************************/
if (!isset($_SESSION['email_recuperacao'])) {
    echo json_encode(["success" => false, "message" => "Nenhum e-mail fornecido ou sessão inválida."]);
    exit;
}

$email = $_SESSION['email_recuperacao'];

/***************************************************************************************************/

/**************** RECEBE AS INFORMAÇÕES DO FRONT-END ************************/
$rawData = file_get_contents("php://input");
$data = json_decode($rawData, true);
/***************************************************************************/

if (!isset($data["senha"])) {
    echo json_encode(["success" => false, "message" => "Senha não fornecida."]);
    exit;
}

$novaSenha = $data["senha"];

/**************** VERIFICA SE A SENHA NOVA É DIFERENTE DA ATUAL ************************/
if (verificarSenhaAtual($conn, $email, $novaSenha)) {
    salvarLog("Usuário tentou alterar a senha para a mesma senha", Acoes::NOVA_SENHA, "erro");

    echo json_encode(["success" => false, "message" => "A nova senha não pode ser igual à atual."]);
    exit;
}
/*************************************************************************************/

/**************** ATUALIZAR A SENHA NO BD ************************/
if (atualizarSenha($conn, $email, $novaSenha)) {
    salvarLog("O usuário de e-mail: $email alterou a senha.", Acoes::NOVA_SENHA);

    echo json_encode(["success" => true]);
} else {
    salvarLog("Erro ao atualizar a senha: $conn->error", Acoes::NOVA_SENHA, "erro");

    echo json_encode(["success" => false, "message" => "Erro ao atualizar a senha."]);
}

$conn->close();
?>