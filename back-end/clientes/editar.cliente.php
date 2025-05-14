<?php 
ini_set("display_errors", 1);
session_start();

include_once "../inc/funcoes.inc.php";

header_remove('X-Powered-By');
header('Content-Type: application/json');

try {
    // Verifica autenticação

    if(!isset($_SESSION["user_id"])) {
        checkLoggedUser($conn, $_SESSION['user_id']);;
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

    // Validação dos campos obrigatórios
    $camposObrigatorios = ['cliente_id', 'nome_empresa_cliente', 'tipo', 'email', 'tel', 'cpf_cnpj', 'cep', 'endereco', 'num_endereco', 'estado', 'cidade'];
    $validacaoDosCampos = validarCampos($data, $camposObrigatorios);
    if ($validacaoDosCampos !== null) { 
        echo json_encode($validacaoDosCampos);
        exit();    
    }

    // Validações específicas
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Email inválido");
    }

    // Conflitos de email/CPF/CNPJ
    $colunas = ["cliente_email", "cliente_cpf_ou_cnpj"];
    $valores = [$data["email"], $data["cpf_cnpj"]];
    
    $conflito = verificarConflitosAtualizacao($conn, "clientes", $colunas, $valores, "cliente_id", $data["cliente_id"]);
    if ($conflito) {
        throw new Exception($conflito['message']);
    }

    // Converte o status (string "1" ou "0") para inteiro
    $statusValue = (int)$data['status'];  // 1 = ativo, 0 = inativo

    // Atualiza cliente
    $camposAtualizados = [
        'cliente_nome_ou_empresa' => $data['nome_empresa_cliente'],
        'cliente_razao_social' => $data['razao_social'],
        'cliente_tipo' => $data['tipo'],
        'cliente_email' => $data['email'],
        'cliente_telefone' => $data['tel'],
        'cliente_cpf_ou_cnpj' => $data['cpf_cnpj'],
        'cliente_cep' => $data['cep'],
        'cliente_endereco' => $data['endereco'],
        'cliente_numendereco' => $data['num_endereco'],
        'cliente_estado' => $data['estado'],
        'cliente_cidade' => $data['cidade'],
        'estaAtivo' => $statusValue,
        'cliente_observacoes' => $data['obs']
    ];

    $resultado = updateData($conn, "clientes", $camposAtualizados, $data['cliente_id'], "cliente_id");
    if (!$resultado['success']) {
        throw new Exception($resultado['message'] ?? "Erro ao atualizar cliente");
    }

    $fields = "
    c.cliente_id,
    c.cliente_nome_ou_empresa,
    c.cliente_razao_social,
    c.cliente_email,
    c.cliente_telefone,
    c.cliente_tipo,
    c.cliente_cpf_ou_cnpj,
    c.cliente_cep,
    c.cliente_endereco,
    c.cliente_numendereco,
    c.cliente_estado,
    c.cliente_cidade,
    c.cliente_observacoes,
    c.cliente_data_cadastro,
    c.estaAtivo
    ";

$joins = [];

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