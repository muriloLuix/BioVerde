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
$camposObrigatorios = ['produto', 'fornecedor', 'dt_colheita', 'quant_inicial', 'unidade', 'tipo', 'dt_validade', 'classificacao', 'localArmazenado'];
$validacaoDosCampos = validarCampos($data, $camposObrigatorios);
if ($validacaoDosCampos !== null) {
    echo json_encode($validacaoDosCampos);
    exit();
}

$uni_id                = (int) $data['unidade'];
$tipo_id               = (int) $data['tipo'];
$fornecedor_id         = (int) $data['fornecedor'];
$classificacao_id      = (int) $data['classificacao'];
$localArmazenamento_id = (int) $data['localArmazenado'];
$data['quant_atual']   = $data['quant_inicial'];

// ------ Criar o código do lote ------

// Buscar prefixo do produto
$produto_id = (int)$data['produto'];
$dataColheita = $data['dt_colheita']; // Exemplo: '2025-05-23'
$dataColheitaFormatada = date('Ymd', strtotime($dataColheita)); // Resultado: '20250523'

// Buscar os 3 primeiros caracteres do nome do produto
$sqlPrefixo = "SELECT LEFT(produto_nome, 3) AS prefixo FROM produtos WHERE produto_id = ?";
$stmtPrefixo = $conn->prepare($sqlPrefixo);
$stmtPrefixo->bind_param("i", $produto_id);
$stmtPrefixo->execute();
$resultPrefixo = $stmtPrefixo->get_result();
$rowPrefixo = $resultPrefixo->fetch_assoc();

if (!$rowPrefixo) {
    echo json_encode(["success" => false, "message" => "Produto não encontrado."]);
    exit();
}

$prefixo = strtoupper($rowPrefixo['prefixo']);

// Contar quantos lotes já existem para esse produto na mesma data de colheita
$sqlCount = "SELECT COUNT(*) AS total FROM lote 
             WHERE produto_id = ? AND DATE(lote_dtColheita) = ?";
$stmtCount = $conn->prepare($sqlCount);
$stmtCount->bind_param("is", $produto_id, $dataColheita);
$stmtCount->execute();
$resultCount = $stmtCount->get_result();
$rowCount = $resultCount->fetch_assoc();
$numeroLote = $rowCount['total'] + 1;

// Montar o código do lote
$lote_codigo = sprintf('%s-%s-%03d', $prefixo, $dataColheitaFormatada, $numeroLote);

// Atribuir ao array para enviar ao banco
$data['lote_codigo'] = $lote_codigo;



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
    $data['dt_colheita'],
    $data['dt_validade'],
    $data['quant_inicial'],
    $data['quant_atual'], 
    $data['obs'],
    $produto_id, 
    $uni_id, 
    $tipo_id, 
    $fornecedor_id,
    $classificacao_id,
    $localArmazenamento_id 
);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Lote cadastrado com sucesso!",
        "lote_codigo" => $lote_codigo
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Erro ao cadastrar o lote: " . $stmt->error
    ]);
}

