<?php
/**************** HEADERS ************************/
header('Content-Type: application/json');
session_start();
include_once("../inc/funcoes.inc.php");
require_once "../MVC/Model.php";
require_once "../usuarios/User.class.php";
$user_id = $_SESSION['user_id'];
$user = Usuario::find($user_id);
verificarAutenticacao($conn);
/*************************************************/

/**************** RECEBE AS INFORMAÇÕES DO FRONT-END ************************/
$rawData = file_get_contents("php://input");
if (!$rawData) {
    echo json_encode(["success" => false, "message" => "Erro ao receber os dados."]);
    exit();
}

$data = json_decode($rawData, true);
/**************************************************************************/

/**************** VALIDAÇÃO DOS CAMPOS ************************/
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
/************************************************************/

/**************** VERIFICAR EMAIL E CNPJ************************/
$emailCpfError = verifyCredentials(
    $conn, 
    "clientes", 
    $data['email'], 
    "cliente_email", 
    $data['cpf_cnpj'], 
    "cliente_documento"
);
if ($emailCpfError) {
    echo json_encode($emailCpfError);
    exit();
}
/************************************************************/

/**************** CADASTRO DO CLIENTE ************************/

$estaAtivo = 1;

// Cadastro do cliente
$stmt = $conn->prepare("INSERT INTO clientes (cliente_nome, cliente_razao_social, cliente_documento, cliente_tipo, cliente_telefone, cliente_email, cliente_endereco, cliente_numendereco, cliente_complemento, cliente_cidade, cliente_estado, cliente_cep, estaAtivo, cliente_observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

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
        echo json_encode(["success" => true, "message" => "Cliente cadastrado com sucesso!"]);
    } else {
        echo json_encode($emailCliente);
        SalvarLog("O usuário ({$user->user_id} - {$user->user_nome}), cadastrou o cliente: {$data['nome_empresa_cliente']}", Acoes::CADASTRAR_CLIENTE, "sucesso");
    }
} else {
    echo json_encode(["success" => false, "message" => "Erro ao cadastrar cliente: " . $stmt->error]);
    SalvarLog("O usuário, ({$user->user_id} - ({$user->user_nome}), tentou cadastrar o cliente: {$data['nome_empresa_cliente']}", Acoes::CADASTRAR_CLIENTE, "erro");
}
/************************************************************/