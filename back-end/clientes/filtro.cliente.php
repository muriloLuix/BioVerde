<?php
/**************** HEADERS ************************/
session_start();
include_once "../inc/funcoes.inc.php";
header_remove('X-Powered-By');
header('Content-Type: application/json');
/************************************************/

/**************** VERIFICA A AUTENTICAÇÃO ************************/
if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "message" => "Usuário não autenticado!"]);
    exit();
}
/*************************************************************/

/**************** VERIFICA A CONEXÃO COM O BANCO ************************/
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Erro na conexão com o banco de dados: " . $conn->connect_error]);
    exit();
}
/*********************************************************************/

/**************** RECEBE AS INFORMAÇÕES DO FRONT-END ************************/
$rawData = file_get_contents("php://input");
$data = json_decode($rawData, true);
/****************************************************************************/

/**************** DEFINE O MAPA DE FILTROS PARA CLIENTES ************************/
$mapaFiltrosCliente = [
    "fnome_cliente"   => ['coluna' => 'c.cliente_nome', 'tipo' => 'like'],
    "fcpf_cnpj"       => ['coluna' => 'c.cliente_documento',     'tipo' => 'like'],
    "ftel"            => ['coluna' => 'c.cliente_telefone',        'tipo' => 'like'],
    "fcidade"         => ['coluna' => 'c.cliente_cidade',          'tipo' => 'like'],
    "festado"         => ['coluna' => 'c.cliente_estado',          'tipo' => 'like'],
    "fdataCadastro"   => ['coluna' => 'DATE(c.cliente_data_cadastro)', 'tipo' => '='],
];
/*********************************************************************************/

/**************** GERA OS FILTROS ************************/
$filtros = buildFilters($data, $mapaFiltrosCliente);
/********************************************************/

/**************** TRATA O STATUS ************************/
if (isset($data['fstatus']) && $data['fstatus'] !== "") {
    // garante inteiro 0 ou 1
    $val = intval($data['fstatus']);
    $filtros['where'][] = "c.estaAtivo = {$val}";
}
/*******************************************************/

/**************** DEFINE AS ESTRUTURAS DE BUSCA ************************/
$buscaCliente = [
    'select' => "
        c.cliente_id,
        c.cliente_nome,
        CASE WHEN c.cliente_tipo = 'juridica' THEN 'Pessoa Jurídica' ELSE 'Pessoa Física' END,
        c.cliente_documento,
        c.cliente_email,
        c.cliente_telefone,
        c.cliente_cep,
        c.cliente_endereco,
        c.cliente_numendereco,
        c.cliente_estado,
        c.cliente_cidade,
        CASE WHEN c.estaAtivo = 1 THEN 'ATIVO' ELSE 'INATIVO' END,
        c.cliente_observacoes,
        c.cliente_data_cadastro,
        c.cliente_razao_social,
        c.cliente_tipo,
        c.estaAtivo
    ",
    'from' => "clientes c",
    'modificadores' => [
        'cliente_data_cadastro' => 'DATE(cliente_data_cadastro)'
    ]
];
/*********************************************************************************/

/**************** BUSCA OS DADOS ************************/
$clientes = findFilters($conn, $buscaCliente, $filtros);
/******************************************************/

// Retorna a resposta
echo json_encode([
    "success" => true,
    "message" => "Filtro aplicado com sucesso!",
    "clientes" => $clientes
]);

$conn->close();

?>