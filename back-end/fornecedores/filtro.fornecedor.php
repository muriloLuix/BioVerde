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

// Define o mapa de filtros para fornecedores
$mapaFiltrosFornecedor = [
    "fnome_empresa"  => ['coluna' => 'fornecedor_nome',        'tipo' => 'like'],
    "fresponsavel"   => 'fornecedor_responsavel',
    "fcnpj"          => 'fornecedor_CNPJ',
    "ftel"           => 'fornecedor_telefone',
    "fcidade"        => 'fornecedor_cidade',
    "festado"        => 'fornecedor_estado',
    "fdataCadastro"  => 'fornecedor_dtcadastro',
    "fstatus"        => 'fornecedor_status',
];

// Gera os filtros com base no mapa
$filtros = buildFilters($data, $mapaFiltrosFornecedor);

// Define a estrutura da consulta
$buscaFornecedor = [
    'select' => "fornecedor_id, fornecedor_nome, fornecedor_razao_social, fornecedor_email, fornecedor_telefone, fornecedor_CNPJ, fornecedor_responsavel, fornecedor_cep, fornecedor_endereco, fornecedor_num_endereco, fornecedor_estado, fornecedor_cidade, s.sta_nome, fornecedor_dtcadastro",
    'from' => "fornecedores f",
    'joins' => [
        "LEFT JOIN status s ON f.fornecedor_status = s.sta_id"
    ],
    'modificadores' => [
        'fornecedor_dtcadastro' => 'DATE(fornecedor_dtcadastro)'
    ]
];

// Busca os dados usando a função genérica
$fornecedores = findFilters($conn, $buscaFornecedor, $filtros);


// Retorna a resposta
echo json_encode([
    "success" => true,
    "message" => "Filtro aplicado com sucesso!",
    "fornecedores" => $fornecedores
]);

$conn->close();

?>