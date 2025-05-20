<?php
session_start();
include_once "../inc/funcoes.inc.php";
header('Content-Type: application/json');

try {
    if ($conn->connect_error) {
        throw new Exception("Erro na conexão com o banco de dados");
    }

    $cols = array("produto_id", "produto_nome", "c.tproduto_nome", "produto_preco", "f.fornecedor_nome_ou_empresa", "sp.staproduto_nome", "produto_observacoes");

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
        ],
        [
            "type" => "INNER",
            "join_table" => "status_produto sp",
            "on" => "a.status_id = sp.staproduto_id"
        ]
    ];

    $produtos = search($conn, "produtos a", implode(",", $cols), $joins);

    $tp_produto = buscarTipoProduto($conn);

    $status_produto = buscarStatus($conn);

    echo json_encode([
        "success" => true,
        "produtos" => $produtos,
        "tp_produto" => $tp_produto,
        "status_produto" => $status_produto
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