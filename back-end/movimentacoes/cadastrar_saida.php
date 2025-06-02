<?php
/**************** HEADERS ************************/
session_start();
include_once "../inc/funcoes.inc.php";
include_once "../MVC/Model.php";
include_once "../usuarios/User.class.php";
include_once "../produtos/Produtos.class.php";
include_once "../lotes/Lote.class.php";
header('Content-Type: application/json');
verificarAutenticacao($conn);
/*************************************************/

/******************* RECEBE AS INFORMAÇÕES DO FRONT-END ***************************/
$rawData = file_get_contents("php://input");
if (!$rawData) {
    echo json_encode(["success" => false, "message" => "Erro ao receber os dados."]);
    exit();
}

$data = json_decode($rawData, true);
/*********************************************************************************/

/**************** VALIDAÇÃO DOS CAMPOS ************************/
$camposObrigatorios = ['produto', 'motivo', 'lote', 'quantidade', 'unidade'];
$validacaoDosCampos = validarCampos($data, $camposObrigatorios);

if ($validacaoDosCampos !== null) {
    echo json_encode($validacaoDosCampos);
    exit();
}
/*************************************************************/

/**************** DEFINE E CONVERTE VALORES *******************/
$motivo_id = (int) $data['motivo'];
$produto_id = (int) $data['produto'];
$uni_id = (int) $data['unidade'];
$lote_id = (int) $data['lote'];
$pedido_id = (int) $data['pedido'] ?? null;
$quantidade = (float) $data['quantidade'];
$destino = $data['destino'];
$mov_tipo = 'saida';
$user_id = $_SESSION['user_id'];
$mov_obs = $data['obs'] ?? null;

/**************** BUSCA DADOS DO LOTE *******************/
$stmt = $conn->prepare("SELECT produto_preco, lote_quantAtual, lote_preco FROM lote WHERE lote_id = ?");
$stmt->bind_param("i", $lote_id);
$stmt->execute();
$result = $stmt->get_result();

if (!$row = $result->fetch_assoc()) {
    echo json_encode(["success" => false, "message" => "Lote não encontrado."]);
    exit();
}

$produto_preco = (float) $row['produto_preco'];
$lote_quantAtual = (float) $row['lote_quantAtual'];
$lote_preco = (float) $row['lote_preco'];
/*******************************************************/

/**************** VERIFICA SE A QUANTIDADE RETIRADA É MAIOR QUE A CAPACIDADE ATUAL *******************/
$nova_quantidade = $lote_quantAtual - $quantidade;

if ($quantidade > $lote_quantAtual) {
    echo json_encode([
        "success" => false,
        "message" => "A quantidade excede a quantidade atual do lote. Quantidade Atual: $lote_quantAtual, Retirando: $quantidade."
    ]);
    exit();
}
/*****************************************************************************************************/

$preco_movimentado = $quantidade * $produto_preco;
$novo_preco_total = max(0, $lote_preco - $preco_movimentado);

/**************** INSERE NA movimentacoes_estoque *******************/
$sql = "INSERT INTO movimentacoes_estoque (mov_tipo, motivo_id, produto_id, uni_id, mov_quantidade, preco_movimentado, lote_id,";
$sql .= " user_id, destino, pedido_id, mov_obs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Erro ao preparar o cadastro: " . $conn->error]);
    exit();
}
$pedido_id = isset($data['pedido']) && $data['pedido'] !== '' ? (int) $data['pedido'] : null;
$stmt->bind_param(
    "siiiddiisis",
    $mov_tipo,
    $motivo_id,
    $produto_id,
    $uni_id,
    $quantidade,
    $preco_movimentado,
    $lote_id,
    $user_id,
    $destino,
    $pedido_id,
    $mov_obs
);
/*******************************************************************/

/**************** INSTANCIA A CLASSE PARA BUSCAR INFORMAÇÕES *******************/
$user = Usuario::find($user_id);
$produto = Produtos::find($produto_id);
$lote = Lote::find($lote_id);
/******************************************************************************/

if ($stmt->execute()) {
    /**************** ATUALIZA O LOTE COM A NOVA QUANTIDADE E NOVO PREÇO TOTAL *******************/
    $updateLote = $conn->prepare("UPDATE lote SET lote_quantAtual = ?, lote_preco = ? WHERE lote_id = ?");
    $updateLote->bind_param("ddi", $nova_quantidade, $novo_preco_total, $lote_id);
    $updateLote->execute();
    /********************************************************************************************/

    echo json_encode(["success" => true, "message" => "Movimentação de saída registrada e lote atualizado com sucesso!"]);
    SalvarLog(
        "O usuário ({$user->user_id} - {$user->user_nome}), cadastrou a movimentação de saída para o produto: \n\n 
    ID:{$produto->produto_id}\n\n 
    Nome: {$produto->produto_nome}\n\n 
    Quantidade retirada: {$quantidade}\n\n 
    Preço movimentado: {$preco_movimentado}\n\n 
    Lote: {$lote->lote_codigo},
    Quantidade anterior: {$lote_quantAtual},
    Nova quantidade: {$nova_quantidade}",
        Acoes::CADASTRAR_SAIDA,
        "sucesso"
    );
} else {
    echo json_encode(["success" => false, "message" => "Erro ao cadastrar movimentação: " . $stmt->error]);
    SalvarLog(
        "O usuário ({$user->user_id} - {$user->user_nome}), tentou cadastrar a movimentação de saída para o produto: \n\n 
    ID:{$produto->produto_id}\n\n 
    Nome: {$produto->produto_nome}\n\n 
    Quantidade retirada: {$quantidade}\n\n 
    Preço movimentado: {$preco_movimentado}\n\n 
    Lote: {$lote->lote_codigo},
    Erro: {$stmt->error}",
        Acoes::CADASTRAR_SAIDA,
        "sucesso"
    );
}
