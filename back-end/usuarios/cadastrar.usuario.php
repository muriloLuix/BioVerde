<?php 
session_start();

// include_once("../inc/ambiente.inc.php");
include_once ("../cors.php");
// include_once ("../log/log.php");
include_once ("funcoes.inc.php");

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../../vendor/phpmailer/phpmailer/src/Exception.php';
require '../../vendor/phpmailer/phpmailer/src/PHPMailer.php';
require '../../vendor/phpmailer/phpmailer/src/SMTP.php';
require '../../vendor/autoload.php';

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
$validationError = validarCampos($data, $requiredFields);
if ($validationError) {
    echo json_encode($validationError);
    exit();
}

// Verificar cargo e nível
$car_id = verificarCargo($conn, $data['cargo']);
if ($car_id === null) {
    echo json_encode(["success" => false, "message" => "Cargo não encontrado."]);
    exit();
}

$nivel_id = verificarNivel($conn, $data['nivel']);
if ($nivel_id === null) {
    echo json_encode(["success" => false, "message" => "Nível de acesso não encontrado."]);
    exit();
}

// Verificar email e CPF
$emailCpfError = verificarEmailCpf($conn, $data['email'], $data['cpf']);
if ($emailCpfError) {
    echo json_encode($emailCpfError);
    exit();
}

// Gerar hash da senha
$senha_hash = password_hash($data['password'], PASSWORD_DEFAULT);

// Cadastro do usuário
$stmt = $conn->prepare("INSERT INTO usuarios (user_nome, user_email, user_telefone, user_CPF, user_senha, car_id, nivel_id) VALUES (?, ?, ?, ?, ?, ?, ?)");
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
    // Enviar email de confirmação
    $emailStatus = enviarEmailCadastro($data['email'], $data);
    if ($emailStatus === true) {
        echo json_encode(["success" => true, "message" => "Usuário e senha cadastrados com sucesso!"]);
    } else {
        echo json_encode($emailStatus);
    }
} else {
    echo json_encode(["success" => false, "message" => "Erro ao cadastrar usuário: " . $conn->error]);
}

$stmt->close();
$conn->close();
?>