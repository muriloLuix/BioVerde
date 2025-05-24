<?php
/**************** HEADERS ************************/
session_start();
include_once "../inc/funcoes.inc.php";
header_remove('X-Powered-By');
header('Content-Type: application/json');
/*************************************************/

/**************** VERIFICA AUTENTICAÇÃO ************************/
if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "message" => "Usuário não autenticado!"]);
    exit();
}

/**************** VERIFICA CONEXÃO COM O BANCO ************************/
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Erro na conexão com o banco de dados: " . $conn->connect_error]);
    exit();
}
/*************************************************************/

/**************** RECEBE AS INFORMAÇÕES DO FRONT-END ************************/
$rawData = file_get_contents("php://input");
$data = json_decode($rawData, true);
/****************************************************************************/

/**************** DEFINE O MAPA DE FILTROS ************************/
$mapaFiltrosFornecedor = [
    "fnome_empresa" => ['coluna' => 'f.fornecedor_nome', 'tipo' => 'like'],
    "fresponsavel" => ['coluna' => 'f.fornecedor_responsavel', 'tipo' => 'like'],
    "fcnpj" => ['coluna' => 'f.fornecedor_documento', 'tipo' => 'like'],
    "ftel" => ['coluna' => 'f.fornecedor_telefone', 'tipo' => 'like'],
    "fcidade" => ['coluna' => 'f.fornecedor_cidade', 'tipo' => 'like'],
    "festado" => ['coluna' => 'f.fornecedor_estado', 'tipo' => 'like'],
    "fdataCadastro" => ['coluna' => 'DATE(f.fornecedor_dtcadastro)', 'tipo' => '='],
];
/*****************************************************************/

/**************** FUNÇÃO PARA GERAR FILTROS ************************/
$filtros = buildFilters($data, $mapaFiltrosFornecedor);
/*******************************************************************/

/**************** TRATA O STATUS ************************/
if (isset($data['fstatus']) && $data['fstatus'] !== "") {
    // garante inteiro 0 ou 1
    $val = intval($data['fstatus']);
    $filtros['where'][] = "f.estaAtivo = {$val}";
}
/********************************************************/

/**************** DEFINE A ESTRUTURA DA CONSULTA ************************/
$buscaFornecedor = [
    'select' => "
     f.fornecedor_id,
     f.fornecedor_nome,
     CASE WHEN f.fornecedor_tipo = 'juridica' THEN 'Pessoa Jurídica' ELSE 'Pessoa Física' END,
     f.fornecedor_documento,
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
/*********************************************************/

/**************** FUNÇÃO PARA BUSCAR DADOS ************************/
$fornecedores = findFilters($conn, $buscaFornecedor, $filtros);
/*****************************************************************/

/**************** RETORNA A RESPOSTA ************************/
echo json_encode([
    "success" => true,
    "message" => "Filtro aplicado com sucesso!",
    "fornecedores" => $fornecedores
]);
/*********************************************************/

$conn->close();

?>