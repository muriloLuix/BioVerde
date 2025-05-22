<?php
session_start();
include_once "../inc/funcoes.inc.php";
header('Content-Type: application/json');

try {
    if ($conn->connect_error) {
        throw new Exception("Erro na conexão com o banco de dados");
    }

    $cols = array("lote_id", "lote_dtFabricacao", "lote_dtExpiracao", "lote_quantidade", "lote_obs", "p.produto_nome", "u.uni_sigla");

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
    ];

    $lotes = search($conn, "lote l", implode(",", $cols), $joins);

    $produtos = buscarProdutos($conn);

    $unidade_medida = buscarUnidadeMedida($conn);

    echo json_encode([
        "success" => true,
        "lotes" => $lotes,
        "produtos" => $produtos,
        "unidade_medida" => $unidade_medida
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