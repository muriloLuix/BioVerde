<?php
/**************** HEADERS ************************/
session_start();
include_once "../inc/funcoes.inc.php";
header('Content-Type: application/json');
verificarAutenticacao($conn);
/*************************************************/

try {

    /**************** BUSCAR OPÇÕES ************************/

    $produtos = buscarProdutos($conn);

    $nome_etapas = buscarEtapasNome($conn);

    /*********************************************************/

    echo json_encode([
        "success" => true,
        "produtos" => $produtos,
        "nome_etapas" => $nome_etapas,
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