<?php 

ini_set("display_errors", 1);

session_start();

include_once "../inc/funcoes.inc.php";

header_remove('X-Powered-By');
header('Content-Type: application/json');

// Verifica autenticação
if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "message" => "Usuário não autenticado!"]);
    exit();
}

// Verifica conexão com o banco
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Erro na conexão com o banco de dados: " . $conn->connect_error]);
    exit();
}

// Processa os dados de entrada
$mapaFiltrosCliente = [
    "fnome_cliente"   => ['coluna' => 'cliente_nome',         'tipo' => 'like'],
    "fcpf_cnpj"       => 'cliente_cpf_cnpj',
    "ftel"            => 'cliente_telefone',
    "fcidade"         => ['coluna' => 'cliente_cidade',       'tipo' => 'like'],
    "festado"         => ['coluna' => 'cliente_estado',       'tipo' => 'like'],
    "fdataCadastro"   => 'cliente_data_cadastro',
    "fstatus"         => 'status',
];

$rawData = file_get_contents("php://input");
$data = json_decode($rawData, true);

// Gera os filtros
$filtros = buildFilters($data, $mapaFiltrosCliente);

// Define estrutura da busca
$buscaCliente = [
    'select' => "cliente_id, cliente_nome, cliente_email, cliente_telefone, cliente_cpf_cnpj, cliente_cep, cliente_endereco, cliente_numendereco, cliente_estado, cliente_cidade, b.sta_nome, cliente_data_cadastro, pedido_id, cliente_observacoes",
    'from' => "clientes a",
    'joins' => [
        "LEFT JOIN status b ON a.status = b.sta_id"
    ],
    'modificadores' => [
        'cliente_data_cadastro' => 'DATE(cliente_data_cadastro)'
    ]
];

// Busca os dados
$clientes = findFilters($conn, $buscaCliente, $filtros);


// Retorna a resposta
echo json_encode([
    "success" => true,
    "message" => "Filtro aplicado com sucesso!",
    "clientes" => $clientes
]);

$conn->close();

?>