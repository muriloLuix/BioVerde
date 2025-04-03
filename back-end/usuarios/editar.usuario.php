<?php 

session_start();

include_once "../inc/funcoes.inc.php";
include_once "../inc/ambiente.inc.php";

configurarSessaoSegura();

header_remove('X-Powered-By');
header('Content-Type: application/json');

// Verifica autenticação
if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "message" => "Usuário não autenticado!"]);
    exit();
}

// Verifica conexão com o banco
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Erro na conexão com o banco de dados: " . $conn->connect_error]);
    exit();
}

// Processa os dados de entrada
$rawData = file_get_contents("php://input");
if (!$rawData) {
    echo json_encode(["success" => false, "message" => "Erro ao receber os dados."]);
    exit();
}

$data = json_decode($rawData, true);

// Validação dos campos obrigatórios
$requiredFields = ['user_id', 'name', 'email', 'tel', 'cpf', 'cargo', 'nivel'];
$validacao = validarCampos($data, $requiredFields);
if ($validacao) {
    echo json_encode($validacao);
    exit();
}

// Verifica se o usuário a ser editado existe
if (!verificarUsuarioExiste($conn, $data['user_id'])) {
    echo json_encode(["success" => false, "message" => "Usuário não encontrado."]);
    exit();
}

// Verifica conflitos de email/CPF
$conflito = verificarConflitosAtualizacao($conn, $data['email'], $data['cpf'], $data['user_id']);
if ($conflito) {
    echo json_encode($conflito);
    exit();
}

// Verifica se cargo e nível existem
$cargoId = verificarCargo($conn, $data['cargo']);
if (isset($cargoId['success']) && !$cargoId['success']) {
    echo json_encode($cargoId);
    exit();
}

$nivelId = verificarNivel($conn, $data['nivel']);
if (isset($nivelId['success']) && !$nivelId['success']) {
    echo json_encode($nivelId);
    exit();
}

// Atualiza os dados do usuário
$resultado = atualizarUsuario($conn, $data['user_id'], $data);

if ($resultado['success']) {
    // Se foi solicitada alteração de senha e foi fornecida
    if (!empty($data['password'])) {
        // Pode adicionar lógica adicional aqui, como enviar email de notificação
    }
    
    echo json_encode(["success" => true, "message" => "Usuário atualizado com sucesso!"]);
} else {
    echo json_encode($resultado);
}

$conn->close();