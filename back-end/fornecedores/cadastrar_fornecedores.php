<?php
header('Content-Type: application/json');
session_start();
include_once("../inc/funcoes.inc.php");

if(!isset($_SESSION["user_id"])) {
    checkLoggedUSer($conn, $_SESSION['user_id']);
    exit;
}

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
$camposObrigatorios = ['nome_empresa_fornecedor', 'email', 'tel', 'tipo', 'cpf_cnpj', 'responsavel', 'cep', 'endereco', 'estado', 'cidade', 'num_endereco'];
$validacaoDosCampos = validarCampos($data, $camposObrigatorios);
$verifiedDocuments = verifyDocuments($data['cpf_cnpj'], $data['tipo']);

if ($validacaoDosCampos !== null) { 
    echo json_encode($validacaoDosCampos);
    exit();    
}
if ($verifiedDocuments["success"] === false) {
    echo json_encode($verifiedDocuments);
    exit();
}


// Verificar email e CNPJ
$emailCpfError = verifyCredentials(
    $conn,
    "fornecedores",                 
    $data['email'],          
    "fornecedor_email",         
    $data['cpf_cnpj'],            
    "fornecedor_cpf_ou_cnpj"         
);
if ($emailCpfError) {
    echo json_encode($emailCpfError);
    exit();
}

$estaAtivo = 1;

// Cadastro do fornecedor
$stmt = $conn->prepare("INSERT INTO fornecedores (fornecedor_nome_ou_empresa, fornecedor_razao_social, fornecedor_email, fornecedor_telefone, fornecedor_cpf_ou_cnpj, fornecedor_tipo, fornecedor_endereco, fornecedor_num_endereco, fornecedor_cidade, fornecedor_estado, fornecedor_cep, fornecedor_responsavel, estaAtivo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Erro ao preparar a query: " . $conn->error]);
    exit();
}

$stmt->bind_param("ssssssssssssi", 
    $data['nome_empresa_fornecedor'], 
    $data['razao_social'],
    $data['email'], 
    $data['tel'], 
    $data['cpf_cnpj'], 
    $data['tipo'], 
    $data['endereco'], 
    $data['num_endereco'], 
    $data['cidade'], 
    $data['estado'], 
    $data['cep'], 
    $data['responsavel'], 
    $estaAtivo
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