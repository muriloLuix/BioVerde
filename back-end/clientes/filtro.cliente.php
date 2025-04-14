<?php 

ini_set("display_errors", 1);

session_start();

include_once "../inc/funcoes.inc.php";

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

$data = json_decode($rawData, true);

$filtros = construirFiltrosCliente($data);

if (isset($filtros['where'])) {
    $filtros['where'] = array_map(function($condition) {
        // Substitui colunas ambíguas pelos aliases corretos
        $condition = preg_replace('/\bsta_id\b/', 'u.sta_id', $condition);
        $condition = preg_replace('/\bcar_id\b/', 'u.car_id', $condition);
        $condition = preg_replace('/\bnivel_id\b/', 'u.nivel_id', $condition);
        return $condition;
    }, $filtros['where']);
}


// Busca os usuários com os filtros aplicados
$clientes = buscarClientesComFiltros($conn, $filtros);

// Retorna a resposta
echo json_encode([
    "success" => true,
    "message" => "Filtro aplicado com sucesso!",
    "clientes" => $clientes
]);

$conn->close();

?>