<?php 

ini_set("display_errors", 1);
session_start();
include_once("../inc/funcoes.inc.php");

header('Content-Type: application/json');

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Erro na conexão com o banco de dados: " . $conn->connect_error]));
}

$termo = isset($_GET['q']) ? trim($_GET['q']) : '';

if ($termo === '') {
    echo json_encode([]);
    exit();
}

$stmt = $conn->prepare("SELECT fornecedor_id, fornecedor_nome FROM fornecedores WHERE fornecedor_nome LIKE ?");
$search = "%$termo%";
$stmt->bind_param("s", $search);
$stmt->execute();

$result = $stmt->get_result();
$fornecedores = [];

while ($row = $result->fetch_assoc()) {
    $fornecedores[] = $row;
}

echo json_encode($fornecedores);

?>
