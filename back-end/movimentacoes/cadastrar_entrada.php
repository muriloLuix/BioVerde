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
$camposObrigatorios = ['produto', 'motivo', 'lote', 'quantidade', 'unidade'];
$validacaoDosCampos = validarCampos($data, $camposObrigatorios);

if ($validacaoDosCampos !== null) {
    echo json_encode($validacaoDosCampos);
    exit();
}

/**************** DEFINE E CONVERTE VALORES *******************/
$motivo_id = (int) $data['motivo'];
$produto_id = (int) $data['produto'];
$uni_id = (int) $data['unidade'];
$lote_id = (int) $data['lote'];
$quantidade = (float) $data['quantidade'];
$mov_tipo = 'entrada';
$user_id = $_SESSION['user_id'];
$mov_obs = $data['obs'] ?? null;

/**************** BUSCA DADOS DO LOTE *******************/
$stmt = $conn->prepare("SELECT produto_preco, localArmazenamento_id, lote_quantAtual, lote_quantMax, lote_preco FROM lote WHERE lote_id = ?");
$stmt->bind_param("i", $lote_id);
$stmt->execute();
$result = $stmt->get_result();

if (!$row = $result->fetch_assoc()) {
    echo json_encode(["success" => false, "message" => "Lote não encontrado."]);
    exit();
}

$produto_preco = (float) $row['produto_preco'];
$localArmazenamento_id = (int) $row['localArmazenamento_id'];
$lote_quantAtual = (float) $row['lote_quantAtual'];
$lote_quantMax = (float) $row['lote_quantMax'];
$lote_preco = (float) $row['lote_preco'];

/**************** VERIFICA SE A QUANTIDADE ADICIONADA É MAIOR QUE A CAPACIDADE MÁXIMA *******************/
$nova_quantidade = $lote_quantAtual + $quantidade;

if ($nova_quantidade > $lote_quantMax) {
    echo json_encode([
        "success" => false,
        "message" => "A quantidade excede a capacidade máxima do lote. Capacidade: $lote_quantMax, Atual: $lote_quantAtual, Adicionando: $quantidade."
    ]);
    exit();
}

$preco_movimentado = $quantidade * $produto_preco;
$novo_preco_total = $lote_preco + $preco_movimentado;

/**************** INSERE NA movimentacoes_estoque *******************/
$sql = "INSERT INTO movimentacoes_estoque (
    mov_tipo,
    motivo_id,
    produto_id,
    uni_id,
    mov_quantidade,
    preco_movimentado,
    lote_id,
    user_id,
    localArmazenamento_id,
    mov_obs
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Erro ao preparar o cadastro: " . $conn->error]);
    exit();
}

$stmt->bind_param(
    "siiiddiiis",
    $mov_tipo,
    $motivo_id,
    $produto_id,
    $uni_id,
    $quantidade,
    $preco_movimentado,
    $lote_id,
    $user_id,
    $localArmazenamento_id,
    $mov_obs
);

if ($stmt->execute()) {
    // Atualiza o lote com nova quantidade e novo preço total
    $updateLote = $conn->prepare("UPDATE lote SET lote_quantAtual = ?, lote_preco = ? WHERE lote_id = ?");
    $updateLote->bind_param("ddi", $nova_quantidade, $novo_preco_total, $lote_id);
    $updateLote->execute();

    echo json_encode(["success" => true, "message" => "Movimentação de entrada registrada e lote atualizado com sucesso!"]);
} else {
    echo json_encode(["success" => false, "message" => "Erro ao cadastrar movimentação: " . $stmt->error]);
}
