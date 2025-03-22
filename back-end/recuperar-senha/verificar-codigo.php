<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Permitir requisições OPTIONS (necessário para CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include_once '../inc/ambiente.inc.php';

$rawData = file_get_contents("php://input");
$data = json_decode($rawData, true);

// Verifique se os dados estão chegando corretamente
var_dump($data);  // Isso vai mostrar o que foi recebido do frontend

if (!isset($data["codigo"])) {
    echo json_encode(["success" => false, "message" => "Código não fornecido."]);
    exit;
}

$codigo = $conn->real_escape_string($data["codigo"]);

// Consultar banco para verificar se o código existe
$sql = "SELECT user_email FROM usuarios WHERE codigo_recuperacao = ?";
$res = $conn->prepare($sql);
$res->bind_param("s", $codigo);
$res->execute();
$res->store_result();

if ($res->num_rows > 0) {
    echo json_encode(["success" => true, "message" => "Código válido!"]);
} else {
    echo json_encode(["success" => false, "message" => "Código inválido."]);
}

$res->close();
$conn->close();
?>