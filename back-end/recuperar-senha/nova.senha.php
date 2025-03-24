<?php 

include_once "../cors.php";

header("Access-Control-Allow-Credentials: true");

session_start(); 

$email = $_SESSION["usu_email"];


// Permitir requisições OPTIONS (necessário para CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include_once '../inc/ambiente.inc.php';

$rawData = file_get_contents("php://input");
$data = json_decode($rawData, true);

if (!isset($data["senha"])) {
    echo json_encode(["success" => false, "message" => "Senha não fornecida."]);
    exit;
}

$senha = $conn->real_escape_string($data["senha"]);

$senha = md5($senha);

// Preparando a consulta SQL para buscar a senha armazenada no banco
$sql = "SELECT usu_senha FROM usuarios WHERE usu_senha = ?";
$res = $conn->prepare($sql);
$res->bind_param("s", $senha);
$res->execute();
$res->store_result();

// Verifica se encontrou um registro com a mesma senha
if ($res->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "A nova senha não pode ser igual à atual."]);
    exit;
} else {
    $sql = "UPDATE usuarios SET usu_senha = ? WHERE usu_email = ?";
    $res = $conn->prepare($sql);
    $res->bind_param("ss", $senha, $email); // Aqui precisa ser "ss"
    $res->execute();
    
    if (!$res->execute()) {
        echo json_encode(["success" => false, "message" => "Erro ao atualizar a senha: " . $conn->error]);
        exit;
    }
    
}

$res->close();
$conn->close();

?>