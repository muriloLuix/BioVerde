<?php

include_once '../inc/funcoes.inc.php';

// Configurações de sessão segura
configurarSessaoSegura();
session_start();

// Headers de segurança
header_remove('X-Powered-By');
header('Content-Type: application/json; charset=UTF-8');

// Verificar conexão com o banco
if ($conn->connect_error) {
    salvarLog($conn, "Erro na conexão com o banco de dados", "login", "erro");
    die(json_encode(["success" => false, "message" => "Erro na conexão com o banco de dados"]));
}

// Processar dados de entrada
$rawData = file_get_contents("php://input");
$data = json_decode($rawData, true);

// Validar campos obrigatórios
if (empty($data) || !isset($data["email"]) || !isset($data["password"])) {
    salvarLog($conn, "Tentativa de login sem email ou senha", "login", "erro");
    echo json_encode(["success" => false, "message" => "Campos obrigatórios não informados."]);
    exit();
}

$email = $conn->real_escape_string($data["email"]);
$password = $data["password"];

// Verificar credenciais
$resultado = verificarCredenciais($conn, $email, $password);

if ($resultado["success"]) {
    // Configurar sessão
    $_SESSION['user_id'] = $resultado["user"]["id"];
    $_SESSION['last_activity'] = time();
    
    salvarLog($conn, "Login bem-sucedido para o usuário: " . $resultado["user"]["id"], "login", "sucesso");
    
    echo json_encode([
        "success" => true,
        "message" => "Login realizado com sucesso!",
        "user" => $resultado["user"]
    ]);
} else {
    salvarLog($conn, "Falha no login para o email: " . $email . " - Motivo: " . $resultado["message"], "login", "erro");
    echo json_encode([
        "success" => false,
        "message" => $resultado["message"]
    ]);
}

$conn->close();
exit();

?>