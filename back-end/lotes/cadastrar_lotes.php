<?php
/**************** HEADERS ************************/
session_start();
include_once "../inc/funcoes.inc.php";
require_once "../MVC/Model.php";
require_once "../usuarios/User.class.php";
require_once "../fornecedores/Fornecedor.class.php";
header_remove('X-Powered-By');
header('Content-Type: application/json');
if (!isset($_SESSION["user_id"])) {
    checkLoggedUSer($conn, $_SESSION['user_id']);
    exit;
}
$user_id = $_SESSION['user_id'];
$user = Usuario::find($user_id);
/*************************************************/

/**************** VERIFICA CONEXÃO COM O BANCO ************************/
if (!isset($conn) || $conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Erro na conexão com o banco de dados: " . $conn->connect_error]));
}
/*********************************************************************/

/**************** RECEBE AS INFORMAÇÕES DO FRONT-END ************************/
$rawData = file_get_contents("php://input");
if (!$rawData) {
    echo json_encode(["success" => false, "message" => "Erro ao receber os dados."]);
    exit();
}

$data = json_decode($rawData, true);
/***************************************************************************/

/**************** VALIDACAO DOS CAMPOS ************************/
$camposObrigatorios = ['produto', 'fornecedor', 'dt_colheita', 'quant_max', 'preco', 'unidade', 'tipo', 'dt_validade', 'classificacao', 'localArmazenado'];
$validacaoDosCampos = validarCampos($data, $camposObrigatorios);
if ($validacaoDosCampos !== null) {
    echo json_encode($validacaoDosCampos);
    exit();
}

/**************** DEFINE E CONVERTE VALORES *******************/
$produto_id = (int) $data['produto'];
$uni_id = (int) $data['unidade'];
$tipo_id = (int) $data['tipo'];
$fornecedor_id = (int) $data['fornecedor'];
$classificacao_id = (int) $data['classificacao'];
$localArmazenamento_id = (int) $data['localArmazenado'];
/************************************************************/

/**************** VALIDAÇÕES DE DATA *******************/
$hoje = date('Y-m-d');
$dataColheita = $data['dt_colheita']; // Exemplo: '2025-05-23'
$dataColheitaFormatada = date('Ymd', strtotime($dataColheita)); // Resultado: '20250523'
$dataValidade = $data['dt_validade'];

if ($dataColheita < $hoje) {
    echo json_encode(["success" => false, "message" => "A data da colheita não pode ser menor que a data atual."]);
    exit();
}
if ($dataValidade < $hoje) {
    echo json_encode(["success" => false, "message" => "A data de validade não pode ser menor que a data atual."]);
    exit();
}
if ($dataColheita > $dataValidade) {
    echo json_encode(["success" => false, "message" => "A data da colheita não pode ser maior que a data de validade."]);
    exit();
}
/************************************************************/

/**************** CRIAR O CÓDIGO DO LOTE ************************/

/**************** BUSCAR OS 3 PRIMEIROS CARACTERES DO NOME DO PRODUTO ************************/
$sqlPrefixo = "SELECT LEFT(produto_nome, 3) AS prefixo FROM produtos WHERE produto_id = ?";
$stmtPrefixo = $conn->prepare($sqlPrefixo);
$stmtPrefixo->bind_param("i", $produto_id);
$stmtPrefixo->execute();
$resultPrefixo = $stmtPrefixo->get_result();
$rowPrefixo = $resultPrefixo->fetch_assoc();
/**********************************************************************************************/

if (!$rowPrefixo) {
    echo json_encode(["success" => false, "message" => "Produto não encontrado."]);
    exit();
}

$prefixo = strtoupper($rowPrefixo['prefixo']);

/**************** CONTAR QUANTOS LOTES JA EXISTEM PARA ESSA PRODUTO NA MESMA DATA DE COLHEITA ************************/
$sqlCount = "SELECT COUNT(*) AS total FROM lote 
             WHERE produto_id = ? AND DATE(lote_dtColheita) = ?";
$stmtCount = $conn->prepare($sqlCount);
$stmtCount->bind_param("is", $produto_id, $dataColheita);
$stmtCount->execute();
$resultCount = $stmtCount->get_result();
$rowCount = $resultCount->fetch_assoc();
$numeroLote = $rowCount['total'] + 1;
/*********************************************************************************************************************/

/**************** MONTAR O CÓDIGO DO LOTE ************************/
$lote_codigo = sprintf('%s-%s-%03d', $prefixo, $dataColheitaFormatada, $numeroLote);
/****************************************************************/

/**************** ATRIBUIR AO ARRAY PARA ENVIAR AO BANCO ************************/
$data['lote_codigo'] = $lote_codigo;

/**************** VERIFICAR CAPACIDADE DO ESTOQUE ************************/
$estoque_id = 1; 
$verificaEstoque = $conn->prepare("SELECT estoque_capacidadeMax, estoque_atual FROM estoque WHERE estoque_id = ?");
$verificaEstoque->bind_param("i", $estoque_id);
$verificaEstoque->execute();
$resultEstoque = $verificaEstoque->get_result();
$dadosEstoque = $resultEstoque->fetch_assoc();

if (!$dadosEstoque) {
    echo json_encode(["success" => false, "message" => "Estoque não encontrado."]);
    exit();
}

$capacidadeMax = (int)$dadosEstoque['estoque_capacidadeMax'];
$estoqueAtual = (int)$dadosEstoque['estoque_atual'];

if ($estoqueAtual + 1 > $capacidadeMax) {
    echo json_encode(["success" => false, "message" => "Capacidade máxima de lotes atingida no estoque."]);
    exit();
}
/****************************************************************/

/**************** CADASTRAR O LOTE ************************/
$sql = "INSERT INTO lote (
    lote_codigo,
    lote_dtColheita,
    lote_dtValidade,
    lote_quantMax,
    produto_preco,
    lote_obs,
    produto_id,
    uni_id,
    tproduto_id,
    fornecedor_id,
    classificacao_id,
    localArmazenamento_id
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Erro ao preparar o cadastro: " . $conn->error]);
    exit();
}

$stmt->bind_param(
    "sssddsiiiiii",
    $data['lote_codigo'],
    $data['dt_colheita'],
    $data['dt_validade'],
    $data['quant_max'],
    $data['preco'],
    $data['obs'],
    $produto_id,
    $uni_id,
    $tipo_id,
    $fornecedor_id,
    $classificacao_id,
    $localArmazenamento_id
);

/****************************************************************/

$fornecedorClass = Fornecedor::find($fornecedor_id);

if ($stmt->execute()) {
    // Atualizar o estoque com a nova quantidade de lotes
    $stmtSincronizaEstoque = $conn->prepare("
        UPDATE estoque 
        SET estoque_atual = (SELECT COUNT(*) FROM lote)
        WHERE estoque_id = ?
    ");
    $stmtSincronizaEstoque->bind_param("i", $estoque_id);
    $stmtSincronizaEstoque->execute();

    echo json_encode([
        "success" => true,
        "message" => "Lote cadastrado com sucesso!",
        "lote_codigo" => $lote_codigo
    ]);
    salvarLog("O usuário ({$user->user_id} - {$user->user_nome}), cadastrou o lote: {$data['lote_codigo']}. Com as seguintes informações: \n\n Data da colheita: {$data['dt_colheita']} \n\n Data de validade: {$data['dt_validade']} \n\n Capacidade Máxima: {$data['quant_max']} \n\n Preço do Produto: {$data['preco']} \n\n Fornecedor: {$fornecedorClass->fornecedor_nome}", Acoes::CADASTRAR_LOTE, "sucesso");
} else {
    echo json_encode([
        "success" => false,
        "message" => "Erro ao cadastrar o lote: " . $stmt->error
    ]);
    salvarLog("O usuário ({$user->user_id} - {$user->user_nome}), tentou cadastrar o lote: {$data['lote_codigo']}. Com as seguintes informações: \n\n Data da colheita: {$data['dt_colheita']} \n\n Data de validade: {$data['dt_validade']} \n\n Capacidade Máxima: {$data['quant_max']} \n\n Preço do Produto: {$data['preco']} \n\n Fornecedor: {$fornecedorClass->fornecedor_nome}. \n\n Motivo do erro: {$stmt->error}", Acoes::CADASTRAR_LOTE, "erro");
}

