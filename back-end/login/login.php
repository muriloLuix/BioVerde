<?php

include_once '../inc/ambiente.inc.php';

// Inicia a sessão para armazenar o ID do usuário
session_start();

// Configuração dos cabeçalhos para permitir requisições de qualquer origem (CORS)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Verificação se a requisição é do tipo OPTIONS (preflight) e responde com sucesso
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Aqui verifica se a conexão com o banco de dados foi bem sucedida
if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Erro na conexão com o banco de dados"]));
}

// Lê os dados enviados no corpo da requisição (JSON) e converte para array PHP
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["email"]) || !isset($data["password"])) {
    echo json_encode(["success" => false, "message" => "Campos obrigatórios não informados."]);
    exit();
}

// Previne SQL Injection escapando caracteres especiais no e-mail
$email = $conn->real_escape_string($data["email"]);
$password = $data["password"];

$sql = "SELECT user_id, user_nome, user_senha FROM usuarios WHERE user_email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$res = $stmt->get_result();

// Verifica se algum usuário foi encontrado
if ($res->num_rows > 0) {
    $userData = $res->fetch_assoc();

    // QUANDO O CADASTRO DE USUARIO FOI CRIADO COM HASH, PODERÁ DESCOMENTAR O CÓDIGO ABAIXO
    // if (password_verify($password, $userData["user_senha"])) {
    //     $_SESSION['user_id'] = $userData["user_id"]; // Salva o ID na sessão
    //     echo json_encode([
    //         "success" => true,
    //         "message" => "Login realizado com sucesso!",
    //         "user" => [
    //             "id" => $userData["user_id"],
    //             "nome" => $userData["user_nome"]
    //         ]
    //     ]);
    // }
    
    // Verifica se a senha informada corresponde à armazenada no banco (usando MD5)
    if (md5($password) === $userData["user_senha"]) {
        $_SESSION['user_id'] = $userData["user_id"]; // Salva o ID na sessão
        echo json_encode([
            "success" => true,
            "message" => "Login realizado com sucesso!",
            "user" => [
                "id" => $userData["user_id"],
                "nome" => $userData["user_nome"]
            ]
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Senha incorreta."]);
    }
} else {
    // Retorna erro se o e-mail não for encontrado no banco de dados
    echo json_encode(["success" => false, "message" => "Usuário ou e-mail não encontrado."]);
}

$conn->close();
?>
