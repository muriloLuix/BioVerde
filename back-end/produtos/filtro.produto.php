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
    "ffornecedor"       => ['coluna' => 'f.fornecedor_nome_ou_empresa', 'tipo' => 'like'],
    "ftipo" => ['coluna' => 'p.tproduto_id'],
    "fstatus"           => 'status_id'
];

// Gera os filtros
$filtros = buildFilters($data, $mapaFiltrosProduto);

// Define a estrutura da consulta de produtos
$buscaProduto = [
    'select' => "p.produto_id, p.produto_nome, t.tproduto_nome, p.produto_preco, f.fornecedor_nome_ou_empresa, s.staproduto_nome, p.produto_observacoes",
    'from' => "produtos p",
    'joins' => [
        "LEFT JOIN fornecedores f ON p.id_fornecedor = f.fornecedor_id",
        "LEFT JOIN tp_produto t ON p.tproduto_id = t.tproduto_id",
        "LEFT JOIN status_produto s ON p.status_id = s.staproduto_id"
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
