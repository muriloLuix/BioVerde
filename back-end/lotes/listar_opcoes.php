<?php
session_start();

include_once "../inc/funcoes.inc.php";

header('Content-Type: application/json');

try {
    if ($conn->connect_error) {
        throw new Exception("Erro na conexão com o banco de dados");
    }

    // Buscar produtos
    $produtos = buscarProdutos($conn);

    $unidade_medida = unidMedida($conn);

    $tp_produto = buscarTipoProduto($conn);

    $status_produto = buscarStatus($conn);

    $fornecedores = buscarFornecedores($conn);

    echo json_encode([
        "success" => true,
        "produtos" => $produtos,
        "unidade_medida" => $unidade_medida,
        "tp_produto" => $tp_produto,
        "status_produto" => $status_produto,
        "fornecedores" => $fornecedores
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