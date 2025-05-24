<?php
/**************** HEADERS ************************/
header('Content-Type: application/json');
session_start();
include_once("../inc/funcoes.inc.php");
require_once("../MVC/Model.php");
require_once("../usuarios/User.class.php");
require_once("../fornecedores/Fornecedor.class.php");
if (!isset($_SESSION["user_id"])) {
    checkLoggedUSer($conn, $_SESSION['user_id']);
    exit;
}
$user_id = $_SESSION['user_id'];
$user = Usuario::find($user_id);
/*************************************************/

/**************** VERIFICA CONEXÃO COM O BANCO ************************/
if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Erro na conexão com o banco de dados: " . $conn->connect_error]));
}
/*************************************************************/

/**************** RECEBE AS INFORMAÇÕES DO FRONT-END ************************/
$rawData = file_get_contents("php://input");
if (!$rawData) {
    echo json_encode(["success" => false, "message" => "Erro ao receber os dados."]);
    exit();
}

$data = json_decode($rawData, true);
/***************************************************************************/

/**************** VALIDAÇÃO DOS CAMPOS ************************/
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

$emailCpfError = verifyCredentials(
    $conn,
    "fornecedores",
    $data['email'],
    "fornecedor_email",
    $data['cpf_cnpj'],
    "fornecedor_documento"
);
if ($emailCpfError) {
    echo json_encode($emailCpfError);
    exit();
}

/**************************************************************/

$estaAtivo = 1;

/**************** CADASTRO DO FORNECEDOR ************************/
$stmt = $conn->prepare("INSERT INTO fornecedores (fornecedor_nome, fornecedor_razao_social, fornecedor_email, fornecedor_telefone, fornecedor_documento, fornecedor_tipo, fornecedor_endereco, fornecedor_num_endereco, fornecedor_complemento, fornecedor_cidade, fornecedor_estado, fornecedor_cep, fornecedor_responsavel, estaAtivo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Erro ao preparar a query: " . $conn->error]);
    exit();
}

$stmt->bind_param("sssssssssssssi",
    $data['nome_empresa_fornecedor'],
    $data['razao_social'],
    $data['email'],
    $data['tel'],
    $data['cpf_cnpj'],
    $data['tipo'],
    $data['endereco'],
    $data['num_endereco'],
    $data['complemento'],
    $data['cidade'],
    $data['estado'],
    $data['cep'],
    $data['responsavel'],
    $estaAtivo
);

if ($stmt->execute()) {

    $emailFornecedor = enviarEmailFornecedor($data['email'], $data);
    if ($emailFornecedor === true) {
        echo json_encode([
            "success" => true,
            "message" =>
                "Fornecedor cadastrado com sucesso!"]);
    } else {
        echo json_encode($emailFornecedor);
        SalvarLog("O usuário ({$user->user_id} - {$user->user_nome}), cadastrou o fornecedor: \n\n{$data['nome_empresa_fornecedor']}", Acoes::CADASTRAR_FORNECEDOR, "sucesso");
    }
} else {
    echo json_encode([
            "success" => false,
            "message" => "Erro ao cadastrar fornecedor: " . $stmt->error]
    );
    SalvarLog("O usuário, ({$user->user_id} - ({$user->user_nome}), tentou cadastrar o fornecedor: {$data['nome_empresa_fornecedor']}. \n\nMotivo do erro: {$stmt->error}", Acoes::CADASTRAR_FORNECEDOR, "erro");

}

/********************************************************************/

$stmt->close();
$conn->close();
?>