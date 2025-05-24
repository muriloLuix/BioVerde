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
$camposObrigatorios = ['nome_empresa_cliente', 'email', 'tipo', 'tel', 'cpf_cnpj', 'cep', 'endereco', 'num_endereco', 'estado', 'cidade'];
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
    "clientes", 
    $data['email'], 
    "cliente_email", 
    $data['cpf_cnpj'], 
    "cliente_cpf_ou_cnpj"
);
if ($emailCpfError) {
    echo json_encode($emailCpfError);
    exit();
}

$estaAtivo = 1;

// Cadastro do cliente
$stmt = $conn->prepare("INSERT INTO clientes (cliente_nome_ou_empresa, cliente_razao_social, cliente_cpf_ou_cnpj, cliente_tipo, cliente_telefone, cliente_email, cliente_endereco, cliente_numendereco, cliente_complemento, cliente_cidade, cliente_estado, cliente_cep, estaAtivo, cliente_observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

$stmt->bind_param("ssssssssssssis", 
    $data['nome_empresa_cliente'], 
    $data['razao_social'], 
    $data['cpf_cnpj'],
    $data['tipo'],
    $data['tel'], 
    $data['email'], 
    $data['endereco'], 
    $data['num_endereco'], 
    $data['complemento'], 
    $data['cidade'], 
    $data['estado'], 
    $data['cep'], 
    $estaAtivo,
    $data['obs']
);

if ($stmt->execute()) {

    $emailCliente = enviarEmailCliente($data['email'], $data);
    if ($emailCliente === true) {
        echo json_encode(["success" => true, "message" => "cliente cadastrado com sucesso!"]);
    } else {
        echo json_encode($emailCliente);
    }
} else {
    echo json_encode(["success" => false, "message" => "Erro ao cadastrar cliente: " . $stmt->error]);
}