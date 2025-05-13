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
        "d.pedido_id",
        "e.cliente_nome_ou_empresa",
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
        "e.cliente_telefone",
        "d.pedido_cep",
        "d.pedido_endereco",
        "d.pedido_num_endereco",
        "d.pedido_complemento",
        "d.pedido_cidade",
        "d.pedido_estado",
        "d.pedido_observacoes",
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
        ],
        [
            'type' => 'INNER',
            'join_table' => 'clientes e',
            'on' => 'd.cliente_id = e.cliente_id'
        ],
        [
            'type' => 'INNER',
            'join_table' => 'status_pedido f',
            'on' => 'd.stapedido_id = f.stapedido_id'
        ],
    ];

    $pedidos = search($conn, "pedido_item a", implode(",", $cols_pedidos), $joins);

    // Agrupar por pedido
    $pedidosAgrupados = [];
    foreach ($pedidos as $item) {
        $pedidoId = $item['pedido_id'];

        if (!isset($pedidosAgrupados[$pedidoId])) {
            $pedidosAgrupados[$pedidoId] = [
                'pedido_id'         => (int)   $item['pedido_id'],
                'pedido_dtCadastro' =>  $item['pedido_dtCadastro'],
                'stapedido_nome' =>  $item['stapedido_nome'],
                'pedido_prevEntrega' => $item['pedido_prevEntrega'],
                'cliente_nome_ou_empresa'  =>  $item['cliente_nome_ou_empresa'],
                'pedido_valor_total' => (float) $item['pedido_valor_total'],
                'cliente_telefone'       =>  $item['cliente_telefone'],
                'pedido_cep'        =>  $item['pedido_cep'],
                'pedido_endereco'        =>  $item['pedido_endereco'],
                'pedido_num_endereco'        =>  $item['pedido_num_endereco'],
                'pedido_complemento'        =>  $item['pedido_complemento'],
                'pedido_cidade'        =>  $item['pedido_cidade'],
                'pedido_estado'        =>  $item['pedido_estado'],
                'pedido_observacoes'        =>  $item['pedido_observacoes'],
                'pedido_itens'       => []
            ];
        }

        $pedidosAgrupados[$pedidoId]['pedido_itens'][] = [
            'pedidoitem_id'        => (int)   $item['pedidoitem_id'],
            'produto_nome'         =>  $item['produto_nome'],
            'pedidoitem_quantidade'=> (int)   $item['pedidoitem_quantidade'],
            'unidade_nome'         =>  $item['uni_nome'],
            'pedidoitem_preco'     => (float) $item['pedidoitem_preco'],
            'pedidoitem_subtotal'  => (float) $item['pedidoitem_subtotal'],
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
