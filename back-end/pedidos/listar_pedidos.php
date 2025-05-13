<?php
session_start();

ini_set("display_errors", '1');
include_once "../inc/funcoes.inc.php";
header('Content-Type: application/json');

try {
    if ($conn->connect_error) {
        throw new Exception("Erro na conexão com o banco de dados");
    }

    $cols_pedidos = array(
        "a.pedidoitem_id",
        "a.pedidoitem_quantidade",
        "a.pedidoitem_preco",
        "a.pedidoitem_subtotal",
        "b.produto_id",
        "b.produto_nome",
        "c.uni_nome",
        "d.pedido_id",
        "d.pedido_cep",
        "d.pedido_endereco",
        "d.pedido_num_endereco",
        "d.pedido_complemento",
        "d.pedido_cidade",
        "d.pedido_estado",
        "d.pedido_prevEntrega",
        "d.pedido_dtCadastro",
        "d.pedido_observacoes",
        "d.pedido_valor_total"
    );

    $joins = [
        [
            'type' => 'INNER',
            'join_table' => 'produtos b',
            'on' => 'a.produto_id = b.produto_id'
        ],
        [
            'type' => 'INNER',
            'join_table' => 'unidade_medida c',
            'on' => 'a.uni_id = c.uni_id'
        ],
        [
            'type' => 'INNER',
            'join_table' => 'pedidos d',
            'on' => 'a.pedidoitem_id = d.pedidoid_itens'
        ]
    ];

    $pedidos = search($conn, "pedido_item a", implode(",", $cols_pedidos), $joins);

    // Agrupar por pedido
    $pedidosAgrupados = [];
    foreach ($pedidos as $item) {
        $pedidoId = $item['pedido_id'];

        if (!isset($pedidosAgrupados[$pedidoId])) {
            $pedidosAgrupados[$pedidoId] = [
                'pedido_id' => $pedidoId,
                'cep' => $item['pedido_cep'],
                'endereco' => $item['pedido_endereco'],
                'numero' => $item['pedido_num_endereco'],
                'complemento' => $item['pedido_complemento'],
                'cidade' => $item['pedido_cidade'],
                'estado' => $item['pedido_estado'],
                'prevEntrega' => $item['pedido_prevEntrega'],
                'dtCadastro' => $item['pedido_dtCadastro'],
                'observacoes' => $item['pedido_observacoes'],
                'valor_total' => $item['pedido_valor_total'],
                'itens' => []
            ];
        }

        $pedidosAgrupados[$pedidoId]['itens'][] = [
            'pedidoitem_id' => $item['pedidoitem_id'],
            'produto_id' => $item['produto_id'],
            'produto_nome' => $item['produto_nome'],
            'quantidade' => $item['pedidoitem_quantidade'],
            'unidade' => $item['uni_nome'],
            'preco' => $item['pedidoitem_preco'],
            'subtotal' => $item['pedidoitem_subtotal']
        ];
    }

    echo json_encode([
        "success" => true,
        "pedidos" => array_values($pedidosAgrupados)
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}

$conn->close();
