<?php

include_once("../inc/funcoes.inc.php");

// Configurações de sessão segura
configurarSessaoSegura();

session_start();
header_remove('X-Powered-By');
header('Content-Type: application/json; charset=UTF-8');

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Erro na conexão com o banco de dados: " . $conn->connect_error]));
}

// Processar dados de entrada
$rawData = file_get_contents("php://input");

if (empty($rawData)) {
    echo json_encode(["success" => false, "message" => "Nenhum dado recebido."]);
    exit;
}

$data = json_decode($rawData, true);

if (empty($data) || !isset($data["email"])) {
    salvarLog("Usuário tentou recuperar senha sem informar o e-mail", Acoes::RECUPERAR_SENHA, "erro");

    echo json_encode(["success" => false, "message" => "E-mail não informado ou erro ao decodificar JSON"]);
    exit;
}

$email = $conn->real_escape_string($data["email"]);

// Verificar se o email existe
if (!verificarEmailExiste($conn, $email)) {
    salvarLog("Usuário tentou recuperar a senha para o e-mail não cadastrado: " . $email, Acoes::RECUPERAR_SENHA, "erro");

    echo json_encode(["success" => false, "message" => "E-mail não cadastrado."]);
    exit;
}

// Armazenar informações na sessão
$_SESSION['email_recuperacao'] = $email;
$_SESSION['expire_time'] = time() + 600;

// Gerar e salvar código de recuperação
$codigo = gerarCodigoRecuperacao();

if (!atualizarCodigoRecuperacao($conn, $email, $codigo)) {
    salvarLog("Falha ao atualizar código de recuperação para o e-mail: " . $email, Acoes::RECUPERAR_SENHA, "erro");

    echo json_encode(["success" => false, "message" => "Erro ao gerar código de recuperação"]);
    exit;
}

// Enviar e-mail com o código
$resultadoEmail = enviarEmailRecuperacao($email, $codigo);

if ($resultadoEmail !== true) {
    echo json_encode($resultadoEmail);
    exit;
}

// Log e resposta de sucesso
salvarLog("Usuário recuperou a senha para o e-mail: " . $email, Acoes::RECUPERAR_SENHA);


echo json_encode([
    "success" => true, 
    "message" => "Código enviado para seu e-mail!", 
    "email" => $email,
    "session_id" => session_id()
]);

$conn->close();