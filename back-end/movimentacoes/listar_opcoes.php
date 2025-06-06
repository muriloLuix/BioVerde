<?php
/**************** HEADERS ************************/
session_start();
include_once "../inc/funcoes.inc.php";
header('Content-Type: application/json');
/*************************************************/
try {
    /**************** BUSCAR E VERIFICAÇÕES ************************/

    verificarAutenticacao($conn, $_SESSION['user_id']);

    $produtos = buscarProdutos($conn);

    $unidade_medida = buscarUnidadeMedida($conn);

    $lotes = buscarLotes($conn);

    $motivoMovimentacoes = buscarMotivoMovimentacoes($conn);

    $pedidos = buscarPedidos($conn);
    
    /*************************************************/
    echo json_encode([
        "success" => true,
        "produtos" => $produtos,
        "unidade_medida" => $unidade_medida,
        "lotes" => $lotes,
        "motivos" => $motivoMovimentacoes,
        "pedidos" => $pedidos
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