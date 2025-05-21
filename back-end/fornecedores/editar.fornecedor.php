<?php 
ini_set("display_errors",1);
session_start();

include_once "../inc/funcoes.inc.php";

// configurarSessaoSegura();

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

    // Validação dos campos obrigatórios
    $camposObrigatorios = ['nome_empresa_fornecedor', 'email', 'tel', 'tipo', 'cpf_cnpj', 'responsavel', 'cep', 'endereco', 'estado', 'cidade', 'num_endereco'];
    $validacaoDosCampos = validarCampos($data, $camposObrigatorios);
    if ($validacaoDosCampos !== null) { 
        echo json_encode($validacaoDosCampos);
        exit();    
    }

    // Validações específicas
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Email inválido");
    }

    // Verifica se o fornecedor existe
    if(!verifyExist($conn, $data["fornecedor_id"], "fornecedor_id", "fornecedores")) {
        throw new Exception("Fornecedor nao encontrado");
    }

    // Conflitos de email/CPF/CNPJ
    $colunas = ["fornecedor_email", "fornecedor_cpf_ou_cnpj"];
    $valores = [$data["email"], $data["cpf_cnpj"]];
    
    $conflito = verificarConflitosAtualizacao($conn, "fornecedores", $colunas, $valores, "fornecedor_id", $data["fornecedor_id"]);
    if ($conflito) {
        throw new Exception($conflito['message']);
    }
    
    // Converte o status (string "1" ou "0") para inteiro
    $statusValue = (int)$data['status'];  // 1 = ativo, 0 = inativo

    // Atualiza fornecedor
    $camposAtualizados = [
        'fornecedor_nome_ou_empresa' => $data['nome_empresa_fornecedor'],
        'fornecedor_razao_social' => $data['razao_social'],
        'fornecedor_email' => $data['email'],
        'fornecedor_telefone' => $data['tel'],
        'fornecedor_tipo' => $data['tipo'],
        'fornecedor_cpf_ou_cnpj' => $data['cpf_cnpj'],
        'fornecedor_responsavel' => $data['responsavel'],
        'fornecedor_cep' => $data['cep'],
        'fornecedor_endereco' => $data['endereco'],
        'fornecedor_num_endereco' => $data['num_endereco'],
        'fornecedor_complemento' => $data['complemento'],
        'fornecedor_cidade' => $data['cidade'],
        'fornecedor_estado' => $data['estado'],
        'estaAtivo' => $statusValue,
    ];

    $resultado = updateData($conn, 'fornecedores', $camposAtualizados, $data['fornecedor_id'], 'fornecedor_id');
    if (!$resultado['success']) {
        throw new Exception($resultado['message'] ?? "Erro ao atualizar fornecedor");
    }

    $fields = "
    f.fornecedor_id,
    f.fornecedor_nome_ou_empresa,
    f.fornecedor_email,
    f.fornecedor_telefone,
    f.fornecedor_tipo,
    f.fornecedor_cpf_ou_cnpj,
    f.fornecedor_cep,
    f.fornecedor_endereco,
    f.fornecedor_num_endereco,
    f.fornecedor_complemento,
    f.fornecedor_estado,
    f.fornecedor_cidade,
    f.fornecedor_responsavel,
    f.fornecedor_razao_social,
    f.fornecedor_dtcadastro,
    f.estaAtivo
    ";

    $fornecedor = searchPersonPerID($conn, $data['fornecedor_id'], 'fornecedores f', $fields, [], 'f.fornecedor_id');

    echo json_encode([
        "success" => true,
        "message" => "Fornecedor atualizado com sucesso!",
        "fornecedor" => $fornecedor 
    ]);

} catch (Exception $e) {
    error_log("Erro em editar.fornecedor.php: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}