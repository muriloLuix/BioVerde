<?php 

session_start();

include_once "../inc/funcoes.inc.php";

// configurarSessaoSegura();

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

// Obtém os filtros construídos
$filtros = construirFiltrosUsuarios($data);

// Busca os usuários com os filtros aplicados
$usuarios = buscarUsuariosComFiltros($conn, $filtros);

// Retorna a resposta
echo json_encode([
    "success" => true,
    "message" => "Filtro aplicado com sucesso!",
    "usuarios" => $usuarios
]);

$conn->close();