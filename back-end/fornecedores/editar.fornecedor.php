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

    // var_dump($data);
    // exit;

        // Validação dos campos obrigatórios
    $camposObrigatorios = ['fornecedor_id', 'nome_empresa', 'razao_social', 'email', 'tel', 'cnpj', 'responsavel', 'status', 'cep', 'endereco', 'estado', 'cidade', 'num_endereco'];
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
    
    if (isset($data['status'])) {
        $statusId = obterIdStatusPorNome($conn, $data['status']);
        
        // Se a função retornar array, é porque deu erro
        if (is_array($statusId)) {
            throw new Exception($statusId['message']);
        }
        
        // Adiciona o ID do status aos dados com o nome correto que a função espera
        $data['sta_id'] = $statusId;
    }

    // Atualiza fornecedor

    $camposAtualizados = [
        'fornecedor_nome' => $data['nome_empresa'],
        'fornecedor_razao_social' => $data['razao_social'],
        'fornecedor_email' => $data['email'],
        'fornecedor_telefone' => $data['tel'],
        'fornecedor_CNPJ' => $data['cnpj'],
        'fornecedor_status' => $data['status'] ?? null,
        'fornecedor_responsavel' => $data['responsavel'],
        'fornecedor_cep' => $data['cep'],
        'fornecedor_endereco' => $data['endereco'],
        'fornecedor_num_endereco' => $data['num_endereco'],
        'fornecedor_cidade' => $data['cidade'],
        'fornecedor_estado' => $data['estado']
    ];

    $resultado = updateData($conn, 'fornecedores', $camposAtualizados, $data['fornecedor_id'], 'fornecedor_id');
    if (!$resultado['success']) {
        throw new Exception($resultado['message'] ?? "Erro ao atualizar usuário");
    }

    $fields = "
    f.fornecedor_id,
    f.fornecedor_nome,
    f.fornecedor_email,
    f.fornecedor_telefone,
    f.fornecedor_CNPJ,
    f.fornecedor_cep,
    f.fornecedor_endereco,
    f.fornecedor_num_endereco,
    f.fornecedor_estado,
    f.fornecedor_cidade,
    f.fornecedor_responsavel,
    f.fornecedor_status,
    f.fornecedor_razao_social,
    f.fornecedor_dtcadastro,
    s.sta_id,
    s.sta_nome
    ";

    $joins = [
        ['type' => 'LEFT', 'join_table' => 'status s', 'on' => 'f.fornecedor_status = s.sta_id']
    ];

    $fornecedor = searchPersonPerID($conn, $data['fornecedor_id'], 'fornecedores f', $fields, $joins, 'f.fornecedor_id');

    echo json_encode([
        "success" => true,
        "message" => "Usuário atualizado com sucesso!",
        "usuario" => $fornecedor 
    ]);



} catch (Exception $e) {
    error_log("Erro em editar.fornecedor.php: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}