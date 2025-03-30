<?php
include_once "../inc/funcoes.inc.php";

// Configurações de segurança
header_remove('X-Powered-By');
header('Content-Type: application/json; charset=UTF-8');

// Verificar conexão com o banco
if ($conn->connect_error) {
    salvarLog($conn, "Erro na conexão com o banco de dados", "verificar_codigo", "erro");
    echo json_encode(["success" => false, "message" => "Erro na conexão com o banco de dados"]);
    exit;
}

// Processar dados de entrada
$rawData = file_get_contents("php://input");
$data = json_decode($rawData, true);

if (empty($data) || !isset($data["codigo"])) {
    salvarLog($conn, "Tentativa de verificação sem código", "verificar_codigo", "erro");
    echo json_encode(["success" => false, "message" => "Código não fornecido"]);
    exit;
}

$codigo = $conn->real_escape_string($data["codigo"]);

// Verificar validade do código
$codigoValido = verificarCodigoRecuperacao($conn, $codigo);

if ($codigoValido) {
    salvarLog($conn, "Código $codigo validado com sucesso", "verificar_codigo", "sucesso");
    echo json_encode(["success" => true, "message" => "Código válido!"]);
} else {
    salvarLog($conn, "Código $codigo inválido ou expirado", "verificar_codigo", "erro");
    echo json_encode(["success" => false, "message" => "Código inválido ou expirado"]);
}

$conn->close();
exit;