<?php
session_start();
include_once("../inc/funcoes.inc.php");
header('Content-Type: application/json');

if ($conn->connect_error) {
    echo json_encode([
        "success" => false,
        "message" => "Erro na conexão com o banco de dados: " . $conn->connect_error
    ]);
    exit;
}

$termo = isset($_GET['q']) ? trim($_GET['q']) : '';

if ($termo === '') {
    $stmt = $conn->prepare("SELECT cliente_id, cliente_nome FROM clientes");
} else {
    $stmt = $conn->prepare("SELECT cliente_id, cliente_nome FROM clientes WHERE cliente_nome LIKE ?");
    $search = "%$termo%";
    $stmt->bind_param("s", $search);
}

$stmt->execute();
$result = $stmt->get_result();

$clientes = [];

while ($row = $result->fetch_assoc()) {
    $clientes[] = $row;
}

echo json_encode([
    "success" => true,
    "clientes" => $clientes
]);

?>
