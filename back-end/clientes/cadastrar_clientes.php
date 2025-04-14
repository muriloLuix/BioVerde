<?php 
 
ini_set("display_errors",1);

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
$camposObrigatorios = ['nome_cliente', 'email', 'tel', 'cpf_cnpj', 'status', 'cep', 'endereco', 'num_endereco', 'estado', 'cidade', 'obs'];
$validacaoDosCampos = validarCampos($data, $camposObrigatorios);
if ($validacaoDosCampos !== null) { 
    echo json_encode($validacaoDosCampos);
    exit();    
}

// Verificar email e CNPJ
$emailCpfError = verificarEmailCnpjCpfCliente($conn, $data['email'], $data['cpf_cnpj']);
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

// Cadastro do cliente

$stmt = $conn->prepare("INSERT INTO clientes (cliente_nome, cliente_cpf_cnpj, cliente_telefone, cliente_email, cliente_endereco, cliente_numendereco, cliente_cidade, cliente_estado, cliente_cep, status, cliente_observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

$stmt->bind_param("sssssssssis", 
    $data['nome_cliente'], 
    $data['cpf_cnpj'],
    $data['tel'], 
    $data['email'], 
    $data['endereco'], 
    $data['num_endereco'], 
    $data['cidade'], 
    $data['estado'], 
    $data['cep'], 
    $sta_id,
    $data['obs']
);

if ($stmt->execute()) {

    $emailFornecedor = enviarEmailCliente($data['email'], $data);
    if ($emailFornecedor === true) {
        echo json_encode(["success" => true, "message" => "Fornecedor cadastrado com sucesso!"]);
    } else {
        echo json_encode($emailFornecedor);
    }
} else {
    echo json_encode(["success" => false, "message" => "Erro ao cadastrar fornecedor: " . $stmt->error]);
}