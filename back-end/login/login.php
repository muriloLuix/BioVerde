<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

include_once '../ambiente.inc.php';

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Erro na conexão com o banco de dados"]));
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["user"]) || !isset($data["email"]) || !isset($data["password"])) {
    echo json_encode(["success" => false, "message" => "Campos obrigatórios não informados."]);
    exit();
}

$user = $conn->real_escape_string($data["user"]);
$email = $conn->real_escape_string($data["email"]);
$password = $data["password"];

// Aqui está buscando o usuário no banco de dados pelo usuário ou email
$sql = "SELECT usu_id, usu_nome, usu_senha FROM usuario WHERE usu_email = '$email' OR usu_nome = '$user'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $userData = $result->fetch_assoc();

    // Verificar senha
    if (password_verify($password, $userData["usu_senha"])) {
        echo json_encode([
            "success" => true,
            "message" => "Login realizado com sucesso!",
            "user" => [
                "id" => $userData["usu_id"],
                "nome" => $userData["usu_nome"]
            ]
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Senha incorreta."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Usuário ou e-mail não encontrado."]);
}

$conn->close();
?>
