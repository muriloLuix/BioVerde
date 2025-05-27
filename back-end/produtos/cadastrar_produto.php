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
$camposObrigatorios = ['produto'];
$validacaoDosCampos = validarCampos($data, $camposObrigatorios);
if ($validacaoDosCampos !== null) {
    echo json_encode($validacaoDosCampos);
    exit();
}

// Verificar se o nome do produto já existe
$verifyName = verifyCredentials(
    $conn,
    'produtos',
    $data['produto'],
    'produto_nome'
);
if ($verifyName !== null) {
    echo json_encode($verifyName);
    exit();
}

// Cadastro do produto
$sql = "INSERT INTO produtos (produto_nome) VALUES (?)";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Erro ao preparar o cadastro: " . $conn->error]);
    exit();
}

$stmt->bind_param(
    "s",
    $data['produto'], // string
);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Produto cadastrado com sucesso!"]);
} else {
    echo json_encode(["success" => false, "message" => "Erro ao cadastrar o Produto: " . $stmt->error]);
}
