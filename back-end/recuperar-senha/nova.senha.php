<?php 

include_once "../inc/funcoes.inc.php";

if (!function_exists('salvarLog')) {
    include_once '../log/log.php';
}

// Configurações de sessão
configurarSessaoSegura();

// Verifique o cabeçalho X-Session-ID
if (isset($_SERVER['HTTP_X_SESSION_ID'])) {
    session_id($_SERVER['HTTP_X_SESSION_ID']);
}

session_start();

if (isset($_SESSION['expire_time']) && time() > $_SESSION['expire_time']) {
    session_unset();
    session_destroy();
    echo json_encode(["success" => false, "message" => "Sessão expirada. Por favor, inicie o processo novamente."]);
    exit;
}

if (!isset($_SESSION['email_recuperacao'])) {
    echo json_encode(["success" => false, "message" => "Nenhum e-mail fornecido ou sessão inválida."]);
    exit;
}

$email = $_SESSION['email_recuperacao'];

header('Content-Type: application/json');
include_once '../inc/ambiente.inc.php'; 

if ($conn->connect_error) {
    error_log("Erro de conexão com o banco: " . $conn->connect_error);
    die(json_encode([
        "success" => false, 
        "message" => "Erro no servidor. Por favor, tente novamente mais tarde."
    ]));
}

$rawData = file_get_contents("php://input");
$data = json_decode($rawData, true);

if (!isset($data["senha"])) {
    echo json_encode(["success" => false, "message" => "Senha não fornecida."]);
    exit;
}

$novaSenha = $data["senha"];

if (verificarSenhaAtual($conn, $email, $novaSenha)) {
    salvarLog($conn, "Usuário tentou alterar a senha para a mesma senha", "login", "erro");
    echo json_encode(["success" => false, "message" => "A nova senha não pode ser igual à atual."]);
    exit;
}

if (atualizarSenha($conn, $email, $novaSenha)) {
    salvarLog($conn, "Usuário alterou a senha", "login", "sucesso");
    echo json_encode(["success"=> true]);
    exit;
} else {
    salvarLog($conn, "Erro ao atualizar a senha", "login", "erro");
    echo json_encode(["success" => false, "message" => "Erro ao atualizar a senha."]);
    exit;
}

$conn->close();
?>
