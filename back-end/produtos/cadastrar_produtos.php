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
$camposObrigatorios = ['nome_produto', 'tipo', 'status', 'preco', 'fornecedor', 'lote'];
$validacaoDosCampos = validarCampos($data, $camposObrigatorios);

if ($validacaoDosCampos !== null) {
    echo json_encode($validacaoDosCampos);
    exit();
}

// Verificar se o nome do produto já existe
$verifyName = verifyCredentials(
    $conn,
    'produtos',
    $data['nome_produto'],
    'produto_nome'
);

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
$sqlFornecedor = "SELECT fornecedor_id FROM fornecedores WHERE fornecedor_nome_ou_empresa = ?";
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

// Verificar ID do tipo
$tp_id = verificarTipo($conn, $data['tipo']);
if ($tp_id === null) {
    error_log("Tipo inválido fornecido: " . $data['tipo']);
    echo json_encode([
        "success" => false,
        "message" => "Tipo inválido. O valor '" . $data['tipo'] . "' não existe na tabela de status."
    ]);
    exit();
}

// Cadastro do produto
$sql = "INSERT INTO produtos (
    produto_nome,
    id_fornecedor,
    produto_preco,
    tproduto_id,
    status_id,
    produto_observacoes
) VALUES (?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Erro ao preparar o cadastro: " . $conn->error]);
    exit();
}

$stmt->bind_param(
    "sisiss",
    $data['nome_produto'], // string
    $fornecedor_id,        // integer
    $data['preco'],        // double/float
    $tp_id,         // integer
    $sta_id,               // integer
    $data['obs']           // string
);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Produto cadastrado com sucesso!"]);
} else {
    echo json_encode(["success" => false, "message" => "Erro ao cadastrar o produto: " . $stmt->error]);
}
