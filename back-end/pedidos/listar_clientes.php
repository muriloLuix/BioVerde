<?php
session_start();
include_once("../inc/funcoes.inc.php");
header('Content-Type: application/json');

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Erro na conexão com o banco de dados: " . $conn->connect_error]));
}

$termo = isset($_GET['q']) ? trim($_GET['q']) : '';

if ($termo === '') {
    $stmt = $conn->prepare("SELECT cliente_id, cliente_nome_ou_empresa FROM clientes");
    $stmt->execute();
} else {
    $stmt = $conn->prepare("SELECT cliente_id, cliente_nome_ou_empresa FROM clientes WHERE cliente_nome_ou_empresa LIKE ?");
    $search = "%$termo%";
    $stmt->bind_param("s", $search);
    $stmt->execute();
}


$result = $stmt->get_result();
$clientes = [];

while ($row = $result->fetch_assoc()) {
    $clientes[] = $row;
}

echo json_encode($clientes);

?>
