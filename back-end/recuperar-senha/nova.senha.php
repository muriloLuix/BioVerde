<?php 

session_start();

// if (isset($_SERVER['HTTP_X_SESSION_ID'])) {
//     session_id($_SERVER['HTTP_X_SESSION_ID']);
// }

include_once "../inc/funcoes.inc.php";

if (!function_exists('salvarLog')) {
    include_once '../log/log.php';
}

if (isset($_SESSION['expire_time']) && time() > $_SESSION['expire_time']) {
    session_unset();
    session_destroy();
    echo json_encode(["success" => false, "message" => "Sessão expirada. Por favor, inicie o processo novamente."]);
    exit;
}

// 6. Verificar se o e-mail de recuperação está salvo na sessão
if (!isset($_SESSION['email_recuperacao'])) {
    echo json_encode(["success" => false, "message" => "Nenhum e-mail fornecido ou sessão inválida."]);
    exit;
}

$email = $_SESSION['email_recuperacao'];

// 7. Configurar cabeçalho de resposta
header('Content-Type: application/json');

// 8. Conectar ao banco de dados
include_once '../inc/ambiente.inc.php'; 

if ($conn->connect_error) {
    error_log("Erro de conexão com o banco: " . $conn->connect_error);
    die(json_encode([
        "success" => false, 
        "message" => "Erro no servidor. Por favor, tente novamente mais tarde."
    ]));
}

// 9. Receber e validar os dados enviados (nova senha)
$rawData = file_get_contents("php://input");
$data = json_decode($rawData, true);

if (!isset($data["senha"])) {
    echo json_encode(["success" => false, "message" => "Senha não fornecida."]);
    exit;
}

$novaSenha = $data["senha"];

// 10. Verificar se a nova senha é diferente da atual
if (verificarSenhaAtual($conn, $email, $novaSenha)) {
    salvarLog($conn, "Usuário tentou alterar a senha para a mesma senha", "login", "erro");
    echo json_encode(["success" => false, "message" => "A nova senha não pode ser igual à atual."]);
    exit;
}

// 11. Atualizar a senha no banco de dados
if (atualizarSenha($conn, $email, $novaSenha)) {
    salvarLog($conn, "Usuário alterou a senha", "login", "sucesso");
    echo json_encode(["success"=> true]);
} else {
    salvarLog($conn, "Erro ao atualizar a senha", "login", "erro");
    echo json_encode(["success" => false, "message" => "Erro ao atualizar a senha."]);
}

$conn->close();
?>
