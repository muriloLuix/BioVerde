<?php
/**************** HEADERS ************************/
session_start();
include_once "../inc/funcoes.inc.php";
header('Content-Type: application/json');
/*************************************************/

try {
    /**************** VERIFICA CONEXÃO COM O BANCO ************************/
    if ($conn->connect_error) {
        throw new Exception("Erro na conexão com o banco de dados");
    }
    /*********************************************************************/

    /**************** CRIA O ARRAY DAS COLUNAS NA TABELA DE LOTE PARA EXIBIÇÃO ************************/

    $cols = array("lote_id", "lote_codigo", "lote_dtColheita", "lote_dtValidade", "lote_quantInicial", "lote_quantAtual", "lote_obs", "p.produto_id", "p.produto_nome", "u.uni_id", "u.uni_sigla", "t.tproduto_id", "t.tproduto_nome", "f.fornecedor_id", "f.fornecedor_nome", "c.classificacao_id", "c.classificacao_nome", "a.localArmazenamento_id", "a.localArmazenamento_nome");

    $joins = [
        [
            "type" => "INNER",
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
            "join_table" => "fornecedores f",
            "on" => "l.fornecedor_id = f.fornecedor_id"
        ],
        [
            "type" => "INNER",
            "join_table" => "classificacao_produto c",
            "on" => "l.classificacao_id = c.classificacao_id"
        ],
        [
            "type" => "INNER",
            "join_table" => "locais_armazenamento a",
            "on" => "l.localArmazenamento_id = a.localArmazenamento_id"
        ],
    ];

    $lotes = search($conn, "lote l", implode(",", $cols), $joins);

    $produtos = buscarProdutos($conn);

    $unidade_medida = buscarUnidadeMedida($conn);

    $tp_produto = buscarTipoProduto($conn);

    $fornecedores = buscarFornecedores($conn);

    $classficacao = buscarClassificacaoProduto($conn);

    $localArmazenado = buscarLocaisArmazenamento($conn);

    /***************************************************************************/

    echo json_encode([
        "success" => true,
        "lotes" => $lotes,
        "produtos" => $produtos,
        "unidade_medida" => $unidade_medida,
        "tp_produto" => $tp_produto,
        "fornecedores" => $fornecedores,
        "classificacao" => $classficacao,
        "localArmazenado" => $localArmazenado
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