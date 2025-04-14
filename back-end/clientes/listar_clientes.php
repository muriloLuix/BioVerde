<?php
session_start();

ini_set("display_errors",'1');

include_once "../inc/funcoes.inc.php";

header('Content-Type: application/json');

try {
    if ($conn->connect_error) {
        throw new Exception("Erro na conexão com o banco de dados");
    }

    // Buscar Clientes
    $clientes = buscarClientes($conn);

    $status = buscarStatus($conn);

    echo json_encode([
        "success" => true,
        "clientes" => $clientes,
        "status"=> $status
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
