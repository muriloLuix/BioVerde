
<?php
include_once("../inc/ambiente.inc.php");
include_once "../cors.php";

header('Content-Type: application/json');

// Buscar cargos
$result = $conn->query("SELECT car_id, car_nome FROM cargo");
$cargos = [];
while ($row = $result->fetch_assoc()) {
    $cargos[] = $row;
}

// Buscar níveis de acesso
$result = $conn->query("SELECT nivel_id, nivel_nome FROM niveis_acesso");
$niveis = [];
while ($row = $result->fetch_assoc()) {
    $niveis[] = $row;
}

echo json_encode([
    "success" => true,
    "cargos" => $cargos,
    "niveis" => $niveis
]);

$conn->close();
?>