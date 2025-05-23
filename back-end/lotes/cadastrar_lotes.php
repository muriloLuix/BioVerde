<?php 
session_start();

ini_set("display_errors", '1');

include_once "../inc/funcoes.inc.php";

header('Content-Type: application/json');

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "message" => "Usuário não autenticado!"]);
    exit();
}

if (!isset($conn) || $conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Erro na conexão com o banco de dados: " . $conn->connect_error]));
}

$rawData = file_get_contents("php://input");
if (!$rawData) {
    echo json_encode(["success" => false, "message" => "Erro ao receber os dados."]);
    exit();
}

$data = json_decode($rawData, true);

// Validação dos campos obrigatórios
$camposObrigatorios = ['produto_nome', 'fornecedor', 'dtColheita', 'quantidade', 'uni_nome', 'tipo', 'dtValidade', 'classificacao', 'localArmazenado',];
$validacaoDosCampos = validarCampos($data, $camposObrigatorios);
if ($validacaoDosCampos !== null) {
    echo json_encode($validacaoDosCampos);
    exit();
}

// Cadastro do lote
$sql = "INSERT INTO lote (
    lote_codigo,
    lote_dtColheita,
    lote_dtValidade,
    lote_quantInicial,
    lote_quantAtual,
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
    $data['dtColheita'],
    $data['dtValidade'],
    $data['quantidade'],  // lote_quantInicial
    $data['quantidade'],  // lote_quantAtual
    $data['obs'],
    (int)$data['produto'], 
    (int)$data['unidade'], 
    (int)$data['tipo'], 
    (int)$data['fornecedor'], 
    (int)$data['classificacao'], 
    (int)$data['localArmazenado']
);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Produto cadastrado com sucesso!"]);
} else {
    echo json_encode(["success" => false, "message" => "Erro ao cadastrar o produto: " . $stmt->error]);
}
