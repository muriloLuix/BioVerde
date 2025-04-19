<?php 
ini_set("display_errors", 1);
session_start();

include_once "../inc/funcoes.inc.php";

header_remove('X-Powered-By');
header('Content-Type: application/json');

try {
    // Verifica autenticação

    if(!isset($_SESSION["user_id"])) {
        checkLoggedUSer($conn, $_SESSION['user_id']);
        exit;
    }

    // Verifica conexão com o banco
    if ($conn->connect_error) {
        throw new Exception("Erro na conexão com o banco: " . $conn->connect_error);
    }

    // Processa os dados de entrada
    $rawData = file_get_contents("php://input");
    if (!$rawData) {
        throw new Exception("Erro ao receber os dados.");
    }

    $data = json_decode($rawData, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON inválido: " . json_last_error_msg());
    }

    // Verifica se o cliente existe
    if(!verifyExist($conn, $data['cliente_id'], 'cliente_id', 'clientes')) {
        throw new Exception('Cliente não encontrado');
    }

    // Validação dos campos obrigatórios (sem status pois vamos tratá-lo separadamente)
    $camposObrigatorios = ['cliente_id', 'nome_cliente', 'email', 'tel', 'cpf_cnpj', 'cep', 'endereco', 'num_endereco', 'estado', 'cidade'];
    $validacaoDosCampos = validarCampos($data, $camposObrigatorios);
    if ($validacaoDosCampos !== null) { 
        echo json_encode($validacaoDosCampos);
        exit();    
    }

    // Validações específicas
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Email inválido");
    }

    // Tratamento do status
    if (empty($data['status'])) {
        throw new Exception("O campo status é obrigatório");
    }

    // Converte o ID do status para garantir que é numérico
    $data['sta_id'] = (int)$data['status'];
    if ($data['sta_id'] <= 0) {
        throw new Exception("Status inválido");
    }

    // Atualiza cliente
    $camposAtualizados = [
        'cliente_nome' => $data['nome_cliente'],
        'cliente_email' => $data['email'],
        'cliente_telefone' => $data['tel'],
        'cliente_cpf_cnpj' => $data['cpf_cnpj'],
        'cliente_cep' => $data['cep'],
        'cliente_endereco' => $data['endereco'],
        'cliente_numendereco' => $data['num_endereco'],
        'cliente_estado' => $data['estado'],
        'cliente_cidade' => $data['cidade'],
        'status' => $data['sta_id'] ?? null
    ];

    $resultado = updateData($conn, "clientes", $camposAtualizados, $data['cliente_id'], "cliente_id");
    if (!$resultado['success']) {
        throw new Exception($resultado['message'] ?? "Erro ao atualizar cliente");
    }

    $fields = "
    c.cliente_id,
    c.cliente_nome,
    c.cliente_email,
    c.cliente_telefone,
    c.cliente_cpf_cnpj,
    c.cliente_cep,
    c.cliente_endereco,
    c.cliente_numendereco,
    c.cliente_estado,
    c.cliente_cidade,
    c.status,
    c.cliente_observacoes,
    c.cliente_data_cadastro,
    s.sta_id
";

$joins = [
    ['type' => 'LEFT', 'join_table' => 'status s', 'on' => 'c.status = s.sta_id']
];

$cliente = searchPersonPerID($conn, $data['cliente_id'], 'clientes c', $fields, $joins, 'c.cliente_id');


    echo json_encode([
        "success" => true,
        "message" => "Cliente atualizado com sucesso!",
        "usuario" => $cliente
    ]);

} catch (Exception $e) {
    error_log("Erro em editar.cliente.php: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}