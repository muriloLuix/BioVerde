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

    $cols = array(
        "mv.mov_id", 
        "mv.mov_data", 
        "CASE WHEN mv.mov_tipo = 'entrada' THEN 'Entrada' ELSE 'Saída' END AS mov_tipo_label",
        "mv.mov_tipo",
        "m.motivo_id", 
        "p.produto_id", 
        "un.uni_id", 
        "mv.mov_quantidade", 
        "l.lote_id", 
        "u.user_id", 
        "a.localArmazenamento_id", 
        "a.localArmazenamento_nome", 
        "mv.destino", 
        "mv.preco_movimentado", 
        "mv.mov_obs", 
        "p.produto_nome", 
        "un.uni_sigla", 
        "l.lote_codigo", 
        "pe.pedido_id",
        "pe.pedido_endereco",
        "u.user_nome"
    );

    $joins = [
        [
            "type" => "INNER",
            "join_table" => "motivo_movimentacoes m",
            "on" => "mv.motivo_id = m.motivo_id"
        ],
        [
            "type" => "INNER",
            "join_table" => "produtos p",
            "on" => "mv.produto_id = p.produto_id"
        ],
        [
            "type" => "INNER",
            "join_table" => "unidade_medida un",
            "on" => "mv.uni_id = un.uni_id"
        ],
        [
            "type" => "INNER",
            "join_table" => "lote l",
            "on" => "mv.lote_id = l.lote_id"
        ],
        [
            "type" => "INNER",
            "join_table" => "usuarios u",
            "on" => "mv.user_id = u.user_id"
        ],
        [
            "type" => "LEFT",
            "join_table" => "locais_armazenamento a",
            "on" => "mv.localArmazenamento_id = a.localArmazenamento_id"
        ],
        [
            "type" => "LEFT",
            "join_table" => "pedidos pe",
            "on" => "mv.pedido_id = pe.pedido_id"
        ],
    ];

    $movimentacoes = search($conn, "movimentacoes_estoque mv", implode(",", $cols), $joins);

    $produtos = buscarProdutos($conn);

    $unidade_medida = buscarUnidadeMedida($conn);

    $localArmazenado = buscarLocaisArmazenamento($conn);

    $motivoMovimentacoes = buscarMotivoMovimentacoes($conn);

    $lotes = buscarLotes($conn);

    $usuarios = buscarUsuarios($conn);

    $pedidos =buscarPedidos($conn);

    /***************************************************************************/

    echo json_encode([
        "success" => true,
        "movimentacoes" => $movimentacoes,
        "produtos" => $produtos,
        "unidade_medida" => $unidade_medida,
        "localArmazenado" => $localArmazenado,
        "motivoMovimentacoes" => $motivoMovimentacoes,
        "lotes" => $lotes,
        "usuarios" => $usuarios,
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