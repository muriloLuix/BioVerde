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
    "fnome_empresa"  => ['coluna' => 'f.fornecedor_nome_ou_empresa', 'tipo' => 'like'],
    "fresponsavel"   => ['coluna' => 'f.fornecedor_responsavel', 'tipo' => 'like'],
    "fcnpj"          => ['coluna' => 'f.fornecedor_cpf_ou_cnpj', 'tipo' => 'like'],
    "ftel"           => ['coluna' => 'f.fornecedor_telefone', 'tipo' => 'like'],
    "fcidade"        => ['coluna' => 'f.fornecedor_cidade', 'tipo' => 'like'],
    "festado"        => ['coluna' => 'f.fornecedor_estado', 'tipo' => 'like'],
    "fdataCadastro"  => ['coluna' => 'DATE(f.fornecedor_dtcadastro)', 'tipo' => '='],
];

// Gera os filtros com base no mapa
$filtros = buildFilters($data, $mapaFiltrosFornecedor);

// Trata o status manualmente para pegar "0" também
if (isset($data['fstatus']) && $data['fstatus'] !== "") {
    // garante inteiro 0 ou 1
    $val = intval($data['fstatus']);
    $filtros['where'][] = "F.estaAtivo = {$val}";
}

// Define a estrutura da consulta
$buscaFornecedor = [
    'select' => "
     f.fornecedor_id,
     f.fornecedor_nome_ou_empresa,
     CASE WHEN f.fornecedor_tipo = 'juridica' THEN 'Pessoa Jurídica' ELSE 'Pessoa Física' END,
     f.fornecedor_cpf_ou_cnpj,
     f.fornecedor_email, 
     f.fornecedor_telefone, 
     f.fornecedor_responsavel,
     f.fornecedor_cep,
     f.fornecedor_endereco,
     f.fornecedor_num_endereco,
     f.fornecedor_cidade,
     f.fornecedor_estado,
     CASE WHEN f.estaAtivo = 1 THEN 'ATIVO' ELSE 'INATIVO' END,
     f.fornecedor_dtcadastro,
     f.fornecedor_razao_social, 
     f.fornecedor_tipo,
     f.estaAtivo
    ",
    'from' => "fornecedores f",
    'modificadores' => [
        'fornecedor_dtcadastro' => 'DATE(f.fornecedor_dtcadastro)'
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