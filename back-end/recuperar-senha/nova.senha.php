<?php 

header('Content-Type: application/json');
include_once '../inc/ambiente.inc.php';

include_once "../cors.php";

if(!isset($_COOKIE["email_recuperacao"])){
    echo json_encode(["success" => false, "message" => "Nenhum e-mail fornecido."]);
    exit;
}

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
    $res->bind_param("ss", $senha, $email); 
    $res->execute();
    
    if (!$res->execute()) {
        echo json_encode(["success" => false, "message" => "Erro ao atualizar a senha: " . $conn->error]);
        exit;
    }
    
}

$res->close();
$conn->close();

?>