<?php 

session_start();
include_once("../inc/funcoes.inc.php");

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
$camposObrigatorios = ['nome_produto', 'tipo', 'lote', 'quantidade', 'unid_medida', 'status', 'preco', 'dt_producao', 'dt_validade', 'fornecedor', 'obs'];
$validacaoDosCampos = validarCampos($data, $camposObrigatorios);
if ($validacaoDosCampos !== null) { 
    echo json_encode($validacaoDosCampos);
    exit();    
}

// Verificar se o nome do produto já existe
$verifyName = verifyCredentials($conn, $data['nome_produto'], 'produtos', 'produto_nome');
if ($verifyName !== null) {
    echo json_encode($verifyName);
    exit();
}

// Verificar ID do status
$sta_id = verificarStatus($conn, $data['status']);
if ($sta_id === null) { 
    error_log("Status inválido fornecido: " . $data['status']);
    echo json_encode([
        "success" => false, 
        "message" => "Status inválido. O valor '" . $data['status'] . "' não existe na tabela de status."
    ]);
    exit();
}

// Buscar ID do fornecedor
$sqlFornecedor = "SELECT fornecedor_id FROM fornecedores WHERE fornecedor_nome = ?";
$stmtFornecedor = $conn->prepare($sqlFornecedor);
if (!$stmtFornecedor) {
    echo json_encode(["success" => false, "message" => "Erro ao preparar consulta de fornecedor: " . $conn->error]);
    exit();
}

$stmtFornecedor->bind_param("s", $data['fornecedor']);
$stmtFornecedor->execute();
$result = $stmtFornecedor->get_result();
$fornecedor = $result->fetch_assoc();

if (!$fornecedor) {
    echo json_encode(["success" => false, "message" => "Fornecedor não encontrado."]);
    exit();
}

$fornecedor_id = $fornecedor['fornecedor_id'];

// Cadastro do produto
$sql = "INSERT INTO produtos (
    produto_nome, 
    id_fornecedor, 
    produto_lote, 
    produto_quantidade, 
    uni_id, 
    produto_preco, 
    produto_dtProducao, 
    produto_validade, 
    tproduto_id, 
    produto_status,
    produto_observacoes
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Erro ao preparar o cadastro: " . $conn->error]);
    exit();
}

$stmt->bind_param(
    "sisdsssssis", 
    $data['nome_produto'],
    $fornecedor_id,
    $data['lote'],
    $data['quantidade'],
    $data['unid_medida'],
    $data['preco'],
    $data['dt_producao'],
    $data['dt_validade'],
    $data['tipo'],
    $sta_id,
    $data['obs']
);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Produto cadastrado com sucesso!"]);
} else {
    echo json_encode(["success" => false, "message" => "Erro ao cadastrar o produto: " . $stmt->error]);
}
