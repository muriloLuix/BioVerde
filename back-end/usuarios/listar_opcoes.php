<?php
include_once("../inc/ambiente.inc.php");
include_once "../cors.php";

header('Content-Type: application/json');

try {
    if ($conn->connect_error) {
        throw new Exception("Erro na conexão com o banco de dados");
    }

    $result = $conn->query("SELECT car_id, car_nome FROM cargo");
    if (!$result) {
        throw new Exception("Erro ao buscar cargos: " . $conn->error);
    }
    
    $cargos = [];
    while ($row = $result->fetch_assoc()) {
        $cargos[] = $row;
    }

    // Buscar níveis de acesso
    $result = $conn->query("SELECT nivel_id, nivel_nome FROM niveis_acesso");
    if (!$result) {
        throw new Exception("Erro ao buscar níveis de acesso: " . $conn->error);
    }
    
    $niveis = [];
    while ($row = $result->fetch_assoc()) {
        $niveis[] = $row;
    }

    echo json_encode([
        "success" => true,
        "cargos" => $cargos,
        "niveis" => $niveis
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}

$conn->close();
?>