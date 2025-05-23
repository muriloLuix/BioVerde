<?php
session_start();
include_once "../inc/funcoes.inc.php";
header('Content-Type: application/json');

try {
    if ($conn->connect_error) {
        throw new Exception("Erro na conexão com o banco de dados");
    }

    $cols = array("lote_id", "lote_dtFabricacao", "lote_dtExpiracao", "lote_quantidade", "lote_localArmazenado", "lote_classificacao", "lote_obs", "p.produto_nome", "u.uni_sigla", "t.tproduto_nome", "s.staproduto_nome", "f.fornecedor_nome_ou_empresa");

    $joins = [
        [
            "type"=> "INNER",
            "join_table" => "produtos p",
            "on" => "l.produto_id = p.produto_id"
        ],
        [
            "type" => "INNER",
            "join_table" => "unidade_medida u",
            "on" => "l.uni_id = u.uni_id"
        ],
        [
            "type" => "INNER",
            "join_table" => "tp_produto t",
            "on" => "l.tproduto_id = t.tproduto_id"
        ],
        [
            "type" => "INNER",
            "join_table" => "status_produto s",
            "on" => "l.staproduto_id = s.staproduto_id"
        ],
        [
            "type" => "INNER",
            "join_table" => "fornecedores f",
            "on" => "l.fornecedor_id = f.fornecedor_id"
        ],
    ];

    $lotes = search($conn, "lote l", implode(",", $cols), $joins);

    $produtos = buscarProdutos($conn);

    $unidade_medida = buscarUnidadeMedida($conn);

    $tp_produto = buscarTipoProduto($conn);

    $status_produto = buscarStatus($conn);

    $fornecedores = buscarFornecedores($conn);

    echo json_encode([
        "success" => true,
        "lotes" => $lotes,
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