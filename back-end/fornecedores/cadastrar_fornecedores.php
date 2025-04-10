<?php 
error_reporting(E_ALL);
ini_set('display_errors', 1);
session_start();
include_once("../inc/funcoes.inc.php");

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "message" => "Usuário não autenticado!"]);
    exit();
}

header('Content-Type: application/json');

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Erro na conexão com o banco de dados: " . $conn->connect_error]));
}

$rawData = file_get_contents("php://input");
if (!$rawData) {
    echo json_encode(["success" => false, "message" => "Erro ao receber os dados."]);
    exit();
}

$data = json_decode($rawData, true);

// Validação dos campos
$camposObrigatorios = ['nome_empresa', 'razao_social', 'email', 'tel', 'cnpj', 'responsavel', 'status', 'cep', 'endereco', 'estado', 'cidade', 'num_endereco'];
$validacaoDosCampos = validarCampos($data, $camposObrigatorios);
if ($validacaoDosCampos !== null) { 
    echo json_encode($validacaoDosCampos);
    exit();    
}

// Verificar email e CNPJ
$emailCpfError = verificarEmailCnpj($conn, $data['email'], $data['cnpj']);
if ($emailCpfError) {
    echo json_encode($emailCpfError);
    exit();
}

$sta_id = verificarStatus($conn, $data['status']);
if ($sta_id === null) { 
    // Adicione mais informações de debug
    error_log("Status inválido fornecido: " . $data['status']);
    echo json_encode([
        "success" => false, 
        "message" => "Status inválido. O valor '".$data['status']."' não existe na tabela de status."
    ]);
    exit();
}

// Cadastro do fornecedor
$stmt = $conn->prepare("INSERT INTO fornecedores (fornecedor_nome, fornecedor_razao_social, fornecedor_email, fornecedor_telefone, fornecedor_CNPJ, fornecedor_endereco, fornecedor_num_endereco, fornecedor_cidade, fornecedor_estado, fornecedor_cep, fornecedor_responsavel, fornecedor_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Erro ao preparar a query: " . $conn->error]);
    exit();
}

$stmt->bind_param("sssssssssssi", 
    $data['nome_empresa'], 
    $data['razao_social'],
    $data['email'], 
    $data['tel'], 
    $data['cnpj'], 
    $data['endereco'], 
    $data['num_endereco'], 
    $data['cidade'], 
    $data['estado'], 
    $data['cep'], 
    $data['responsavel'], 
    $sta_id
);

if ($stmt->execute()) {

    $emailFornecedor = enviarEmailFornecedor($data['email'], $data);
    if ($emailFornecedor === true) {
        echo json_encode(["success" => true, "message" => "Fornecedor cadastrado com sucesso!"]);
    } else {
        echo json_encode($emailFornecedor);
    }
} else {
    echo json_encode(["success" => false, "message" => "Erro ao cadastrar fornecedor: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>