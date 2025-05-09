<?php
session_start();

ini_set('display_errors', 1);

include_once "../inc/funcoes.inc.php";

header('Content-Type: application/json');

try {
    if ($conn->connect_error) {
        throw new Exception("Erro na conexão com o banco de dados");
    }

    $cols = array("produto_id", "produto_nome", "tproduto_nome", "produto_lote", "produto_preco", "produto_status", "f.fornecedor_nome", "produto_observacoes");

    $joins = [
        [
            "type"=> "INNER",
            "join_table" => "fornecedores f",
            "on" => "a.id_fornecedor = f.fornecedor_id"
        ],
        [
            "type" => "INNER",
            "join_table" => "tp_produto c",
            "on" => "a.tproduto_id = c.tproduto_id"
        ]
    ];

    $produtos = search($conn, "produtos a", implode(",", $cols), $joins);

    $tp_produto = buscarTipoProduto($conn);

    $unidade_medida = buscarUnidadeMedida($conn);

    echo json_encode([
        "success" => true,
        "produtos" => $produtos,
        "tp_produto" => $tp_produto,
        "unidades_medida" => $unidade_medida
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