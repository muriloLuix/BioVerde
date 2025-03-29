<?php 
session_start();

include_once("../inc/ambiente.inc.php");
include_once "../cors.php";

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "message" => "Usuário não autenticado!"]);
    exit();
}

header('Content-Type: application/json');

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Erro na conexão com o banco de dados: " . $conn->connect_error]));
}

$rawData = file_get_contents("php://input");

if (!$rawData) {
    echo json_encode(["success" => false, "message" => "Erro ao receber os dados."]);
    exit();
}

$data = json_decode($rawData, true);

// Validação dos dados recebidos
$requiredFields = ['name', 'email', 'tel', 'cpf', 'cargo', 'nivel', 'password'];
foreach ($requiredFields as $field) {
    if (!isset($data[$field]) || empty($data[$field])) {
        echo json_encode(["success" => false, "message" => "O campo " . $field . " é obrigatório."]);
        exit();
    }
}

$stmt = $conn->prepare("SELECT car_id FROM cargo WHERE car_nome = ?");
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Erro ao preparar consulta de cargos: " . $conn->error]);
    exit();
}

$stmt->bind_param("s", $data['cargo']);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Cargo não encontrado."]);
    exit();
}

$cargo = $result->fetch_assoc();
$car_id = $cargo['car_id'];
$stmt->close();

$stmt = $conn->prepare("SELECT nivel_id FROM niveis_acesso WHERE nivel_nome = ?");
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Erro ao preparar consulta de níveis: " . $conn->error]);
    exit();
}

$stmt->bind_param("s", $data['nivel']);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Nível de acesso não encontrado."]);
    exit();
}

$nivel = $result->fetch_assoc();
$nivel_id = $nivel['nivel_id'];
$stmt->close();

$senha_hash = password_hash($data['password'], PASSWORD_DEFAULT);

$stmt = $conn->prepare("INSERT INTO usuarios 
                       (user_nome, user_email, user_telefone, user_CPF, user_senha, car_id, nivel_id) 
                       VALUES (?, ?, ?, ?, ?, ?, ?)");

if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Erro ao preparar a query: " . $conn->error]);
    exit();
}

$stmt->bind_param("sssssii", 
    $data['name'],
    $data['email'],
    $data['tel'],
    $data['cpf'],
    $senha_hash,
    $car_id,
    $nivel_id
);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Usuário cadastrado com sucesso!"]);
} else {
    if ($conn->errno == 1062) {
        echo json_encode(["success" => false, "message" => "Erro: CPF ou e-mail já cadastrado."]);
    } else {
        echo json_encode(["success" => false, "message" => "Erro ao cadastrar usuário: " . $conn->error]);
    }
}

$stmt->close();
$conn->close();
?>