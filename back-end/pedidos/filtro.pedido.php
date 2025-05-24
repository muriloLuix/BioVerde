<?php
ini_set("display_errors", 1);
session_start();
include_once "../inc/funcoes.inc.php";

header_remove('X-Powered-By');
header('Content-Type: application/json');

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "message" => "Usuário não autenticado!"]);
    exit();
}
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Erro na conexão: " . $conn->connect_error]);
    exit();
}

$rawData = file_get_contents("php://input");
$data    = json_decode($rawData, true);

// 1) Mapa sem o status
$mapaFiltrosPedido = [
    "fnum_pedido"         => ['coluna'=>'ped.pedido_id',       'tipo'=>'like'],
    "fnome_cliente"        => ['coluna'=>'cli.cliente_nome',      'tipo'=>'like'],
    "ftel"          => ['coluna'=>'cli.cliente_telefone',   'tipo'=>'like'],
    "fstatus"          => ['coluna'=>'sta.stapedido_nome',        'tipo'=>'like'],
    "fcep"        => ['coluna'=>'ped.pedido_cep',        'tipo'=>'like'],
    "festado"        => ['coluna'=>'ped.pedido_estado',      'tipo'=>'like'],
    "fcidade" => ['coluna'=>'ped.pedido_cidade', 'tipo'=>'='],
    "fprev_entrega" => ['coluna'=>'DATE(ped.pedido_prevEntrega)', 'tipo'=>'='],
    "fdt_cadastro" => ['coluna'=>'DATE(ped.pedido_dtCadastro)', 'tipo'=>'='],
];

$filtros = buildFilters($data, $mapaFiltrosPedido);

// 3) Monta SELECT certificando-se de que o CASE vem **antes** do estaAtivo
$buscaPedido = [
    'select' => "
                    ped.pedido_id,
                    cli.cliente_nome,
                    cli.cliente_telefone,
                    sta.stapedido_nome,
                    ped.pedido_cep,
                    ped.pedido_estado,
                    ped.pedido_cidade,
                    ped.pedido_prevEntrega,
                    ped.pedido_dtCadastro
              ",
    'from' => "pedidos ped",
    'joins' => [
        "INNER JOIN clientes cli ON ped.cliente_id = cli.cliente_id",
        "INNER JOIN status_pedido sta ON ped.stapedido_id = sta.stapedido_id",
    ],
    'modificadores' => [
        'ped.pedido_prevEntrega' => 'DATE(ped.pedido_prevEntrega)',
        'ped.pedido_dtCadastro' => 'DATE(ped.pedido_dtCadastro)',
    ]
];

$pedidos = findFilters($conn, $buscaPedido, $filtros);

echo json_encode([
    "success"  => true,
    "message"  => "Filtro aplicado com sucesso!",
    "usuarios" => $pedidos
]);

$conn->close();