<?php
session_start();

include_once "../inc/funcoes.inc.php";

header('Content-Type: application/json');

try {
    if ($conn->connect_error) {
        throw new Exception("Erro na conexão com o banco de dados");
    }

    // Buscar cargos
    $cargos = buscarCargos($conn);
    // Buscar níveis de acesso
    $niveis = buscarNiveisAcesso($conn);

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