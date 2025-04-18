<?php
session_start();

include_once "../inc/funcoes.inc.php";

header('Content-Type: application/json');

try {
    if ($conn->connect_error) {
        throw new Exception("Erro na conexão com o banco de dados");
    }

    $cols = array("produto_id", "produto_nome", "produto_tipo", "produto_lote", "produto_quantidade", "produto_unidade_medida", "produto_preco", "f.fornecedor_nome", "produto_status", "produto_dtProducao", "produto_validade", "produto_data_cadastro");

    $joins = [
        [
            "type" => "INNER",
            "join_table" => "status b",
            "on" => "a.produto_status = b.sta_id"
        ],
        [
            "type"=> "INNER",
            "join_table" => "fornecedores f",
            "on" => "a.id_fornecedor = f.fornecedor_id"
        ]
    ];

    $produtos = search($conn, "produtos a", implode(",", $cols), $joins);

    $status = buscarStatus($conn);

    echo json_encode([
        "success" => true,
        "produtos" => $fornecedores,
        "status" => $status
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