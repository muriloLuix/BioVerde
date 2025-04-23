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
$rawData = file_get_contents("php://input");
$data = json_decode($rawData, true);

// Define o mapa de filtros para produtos
$mapaFiltrosProduto = [
    "fnome_produto"     => ['coluna' => 'produto_nome', 'tipo' => 'like'],
    "ffornecedor"       => ['coluna' => 'f.fornecedor_nome', 'tipo' => 'like'],
    "ftipo" => ['coluna' => 'p.tproduto_id'],
    "flote"             => 'produto_lote',
    "fquantidade"       => 'produto_quantidade',
    "funid_medida"      => ['coluna' => 'p.uni_id'],
    "fdt_producao"      => 'produto_dtProducao',
    "fdt_validade"      => 'produto_validade',
    "fdt_cadastro"      => 'produto_data_cadastro',
    "fstatus"           => 'produto_status'
];

// Gera os filtros
$filtros = buildFilters($data, $mapaFiltrosProduto);

// Define a estrutura da consulta de produtos
$buscaProduto = [
    'select' => "p.produto_id, p.produto_nome, t.tproduto_nome, p.produto_lote, p.produto_quantidade, u.uni_nome, p.produto_preco, f.fornecedor_nome, s.sta_nome, p.produto_dtProducao, p.produto_validade, p.produto_data_cadastro, p.produto_observacoes",
    'from' => "produtos p",
    'joins' => [
        "LEFT JOIN fornecedores f ON p.id_fornecedor = f.fornecedor_id",
        "LEFT JOIN tp_produto t ON p.tproduto_id = t.tproduto_id",
        "LEFT JOIN unidade_medida u ON p.uni_id = u.uni_id",
        "LEFT JOIN status s ON p.produto_status = s.sta_id"
    ],
    'modificadores' => [
        'produto_data_cadastro' => 'DATE(produto_data_cadastro)'
    ]
];

// Executa a busca
$produtos = findFilters($conn, $buscaProduto, $filtros);

// Retorna a resposta
echo json_encode([
    "success" => true,
    "message" => "Filtro aplicado com sucesso!",
    "produtos" => $produtos
]);

$conn->close();
