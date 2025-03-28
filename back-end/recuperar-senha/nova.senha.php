<?php 

// Inclua o cors.php no início
include_once "../cors.php";
include_once '../log/log.php';

// Configurações de sessão
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 0);
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.use_strict_mode', 1);

// Verifique o cabeçalho X-Session-ID
if (isset($_SERVER['HTTP_X_SESSION_ID'])) {
    session_id($_SERVER['HTTP_X_SESSION_ID']);
}

session_start();

// Verifique se a sessão expirou
if (isset($_SESSION['expire_time']) && time() > $_SESSION['expire_time']) {
    session_unset();
    session_destroy();
    echo json_encode(["success" => false, "message" => "Sessão expirada. Por favor, inicie o processo novamente."]);
    exit;
}

// Verifique se o email está na sessão
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

include_once "../cors.php";

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Erro na conexão com o banco de dados: " . $conn->connect_error]));
}

$rawData = file_get_contents("php://input");
$data = json_decode($rawData, true);

if (!isset($data["senha"])) {
    echo json_encode(["success" => false, "message" => "Senha não fornecida."]);
    exit;
}

$senha = $conn->real_escape_string($data["senha"]);

$senha = md5($senha);

// QUANDO O CADASTRO DE USUARIO FOI CRIADO COM HASH, PODERÁ DESCOMENTAR O CÓDIGO ABAIXO
// $senha = password_hash($senha, PASSWORD_DEFAULT);

// Preparando a consulta SQL para buscar a senha armazenada no banco
$sql = "SELECT user_senha FROM usuarios WHERE user_senha = ? AND user_email = ?";
$res = $conn->prepare($sql);
$res->bind_param("ss", $senha, $email);
$res->execute();
$res->store_result();

// Verifica se encontrou um registro com a mesma senha
if ($res->num_rows > 0) {
    salvarLog($conn, "Usuário tentou alterar a senha para a mesma senha", "login", "erro");
    echo json_encode(["success" => false, "message" => "A nova senha não pode ser igual à atual."]);
    exit;
} else {
    $sql = "UPDATE usuarios SET user_senha = ? WHERE user_email = ?";
    $res = $conn->prepare($sql);
    $res->bind_param("ss", $senha, $email); 
    $res->execute();
    
    if (!$res->execute()) {
        salvarLog($conn, "Erro ao atualizar a senha", "login", "erro");
        echo json_encode(["success" => false, "message" => "Erro ao atualizar a senha: " . $conn->error]);
        exit;
    } else {
        salvarLog($conn, "Usuário alterou a senha", "login", "sucesso");
        echo json_encode(["success"=> true]);
        exit;
    }
    
}

$res->close();
$conn->close();

?>