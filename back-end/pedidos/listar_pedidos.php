<?php
session_start();
ini_set('display_errors', 1);
include_once "../inc/funcoes.inc.php";
header('Content-Type: application/json');

try {
    if ($conn->connect_error) {
        throw new Exception("Erro na conexão com o banco de dados");
    }

    $cols_pedidos = [
        "d.pedido_id",
        "e.cliente_nome",
        "e.cliente_id",
        "d.pedido_dtCadastro",
        "f.stapedido_nome",
        "d.pedido_prevEntrega AS pedido_prevEntrega",
        "a.pedidoitem_id",
        "b.produto_id",
        "b.produto_nome",
        "a.pedidoitem_quantidade",
        "c.uni_nome",
        "a.pedidoitem_preco",
        "a.pedidoitem_subtotal",
        "d.pedido_valor_total",
        "d.pedido_telefone",
        "d.pedido_cep",
        "d.pedido_endereco",
        "d.pedido_num_endereco",
        "d.pedido_complemento",
        "d.pedido_cidade",
        "d.pedido_estado",
        "d.pedido_observacoes",
        "f.stapedido_id"
    ];

    $joins = [
        // Primeiro: dados do pedido (sempre obrigatórios)
        [
            'type'       => 'INNER',
            'join_table' => 'clientes e',
            'on'         => 'd.cliente_id = e.cliente_id'
        ],
        [
            'type'       => 'INNER',
            'join_table' => 'status_pedido f',
            'on'         => 'd.stapedido_id = f.stapedido_id'
        ],

        // Agora traga itens se existirem
        [
            'type'       => 'LEFT',
            'join_table' => 'pedido_item a',
            'on'         => 'a.pedido_id = d.pedido_id'
        ],
        [
            'type'       => 'LEFT',
            'join_table' => 'produtos b',
            'on'         => 'a.produto_id = b.produto_id'
        ],
        [
            'type'       => 'LEFT',
            'join_table' => 'unidade_medida c',
            'on'         => 'a.uni_id = c.uni_id'
        ],
    ];

    $pedidos = search(
        $conn,
        "pedidos d",
        implode(",", $cols_pedidos),
        $joins
    );

    // Agrupamento e saída JSON continuam iguais
    $pedidosAgrupados = [];
    foreach ($pedidos as $item) {
        $id = (int)$item['pedido_id'];
        if (!isset($pedidosAgrupados[$id])) {
            $pedidosAgrupados[$id] = [
                'pedido_id'         => $id,
                'pedido_dtCadastro' => $item['pedido_dtCadastro'],
                'cliente_id'        => $item['cliente_id'],
                'cliente_nome'      => $item['cliente_nome'],
                'stapedido_nome'    => $item['stapedido_nome'],
                'stapedido_id'      => $item['stapedido_id'],
                'pedido_prevEntrega'=> $item['pedido_prevEntrega'],
                'pedido_valor_total'=> (float)$item['pedido_valor_total'],
                'pedido_telefone'   => $item['pedido_telefone'],
                'pedido_cep'        => $item['pedido_cep'],
                'pedido_endereco'   => $item['pedido_endereco'],
                'pedido_num_endereco'=> $item['pedido_num_endereco'],
                'pedido_complemento'=> $item['pedido_complemento'],
                'pedido_cidade'     => $item['pedido_cidade'],
                'pedido_estado'     => $item['pedido_estado'],
                'pedido_observacoes'=> $item['pedido_observacoes'],
                'pedido_itens'      => []
            ];
        }
        // se não houver item, pedidoitem_id virá NULL e você pode decidir pular ou não
        if (! is_null($item['pedidoitem_id'])) {
            $pedidosAgrupados[$id]['pedido_itens'][] = [
                'pedidoitem_id'        => (int)$item['pedidoitem_id'],
                'produto_nome'         => $item['produto_nome'],
                'pedidoitem_quantidade'=> (int)$item['pedidoitem_quantidade'],
                'unidade_nome'         => $item['uni_nome'],
                'pedidoitem_preco'     => (float)$item['pedidoitem_preco'],
                'pedidoitem_subtotal'  => (float)$item['pedidoitem_subtotal'],
            ];
        }
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
