<?php
/**************** HEADERS ************************/
session_start();
include_once "../inc/funcoes.inc.php";
header('Content-Type: application/json');
verificarAutenticacao($conn);
/************************************************/
try {

    /**************** BUSCA O STATUS ************************/
    $status = buscarStatus($conn);
    echo json_encode([
        "success" => true,
        "status" => $status
    ]);
    /*******************************************************/

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}

$conn->close();

?>