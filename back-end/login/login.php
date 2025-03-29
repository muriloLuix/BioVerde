<?php

session_start();

//ini_set("display_errors","1");
// error_reporting(E_ALL);

include_once '../inc/ambiente.inc.php';
include_once '../log/log.php';
include_once '../cors.php';

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
    
    // Verifica se a senha informada corresponde à armazenada no banco (usando hash)
    if (password_verify($password, $userData["user_senha"])) {
        $_SESSION['user_id'] = $userData["user_id"]; 

        $sql = "SELECT user_id, user_nome FROM usuarios WHERE user_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $userData["user_id"]);
        $stmt->execute();
        $res = $stmt->get_result();
        $userData = $res->fetch_assoc();

        salvarLog($conn, "Usuário realizou login no sistema", "login", "sucesso");

        echo json_encode([
            "success" => true,
            "message" => "Login realizado com sucesso!",
            "user" => [
                "id" => $userData["user_id"],
                "nome" => $userData["user_nome"]
            ]
        ]);
    } else {
        salvarLog($conn, "O usuário tentou realizar login com a senha incorreta para o e-mail:" . $email, "login", "erro");

        echo json_encode(["success" => false, "message" => "Senha incorreta."]);
    }
} else {
    salvarLog($conn, "O usuário tentou realizar login com o e-mail incorreto!", "login", "erro");
    // Retorna erro se o e-mail não for encontrado no banco de dados
    echo json_encode(["success" => false, "message" => "Usuário ou e-mail não encontrado."]);
}

$conn->close();
?>
