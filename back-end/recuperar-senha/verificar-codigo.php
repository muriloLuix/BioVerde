<?php
include_once "../cors.php";
include_once '../log/log.php';
include_once '../inc/ambiente.inc.php';

$rawData = file_get_contents("php://input");
$data = json_decode($rawData, true);

if (!isset($data["codigo"])) {
    salvarLog($conn, "Usuário tentou reenviar o código de recuperação para o e-mail: " . $email, "verificar_codigo", "erro");
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
    salvarLog($conn, "Usuário teve o código: " . $codigo . " validado com sucesso", "verificar_codigo", "sucesso");
    echo json_encode(["success" => true, "message" => "Código válido!"]);
    exit;
} else {
    salvarLog($conn, "Usuário teve o código: " . $codigo . " invalidado", "verificar_codigo", "erro");
    echo json_encode(["success" => false, "message" => "Código inválido."]);
    exit;
}

$res->close();
$conn->close();
?>