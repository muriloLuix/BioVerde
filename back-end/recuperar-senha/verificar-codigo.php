<?php
include_once "../cors.php";


// Permitir requisições OPTIONS (necessário para CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include_once '../inc/ambiente.inc.php';

$rawData = file_get_contents("php://input");
$data = json_decode($rawData, true);

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