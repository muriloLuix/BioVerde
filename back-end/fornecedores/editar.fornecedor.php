<?php 

session_start();

include_once "../inc/funcoes.inc.php";

// configurarSessaoSegura();

header_remove('X-Powered-By');
header('Content-Type: application/json');

try {
    // Verifica autenticação
    if (!isset($_SESSION["user_id"])) {
        throw new Exception("Usuário não autenticado!");
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

    var_dump($data);
    exit;

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
    if (!verificarFornecedorExiste($conn, $data['fornecedor_id'])) {
        throw new Exception("Fornecedor não encontrado.");
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
    $resultado = atualizarFornecedor($conn, $data['fornecedor_id'], $data);
    if (!$resultado['success']) {
        throw new Exception($resultado['message'] ?? "Erro ao atualizar usuário");
    }

    $usuarioAtualizado = buscarUsuarioPorId($conn, $data['fornecedor_id']);

    echo json_encode([
        "success" => true,
        "message" => "Usuário atualizado com sucesso!",
        "usuario" => $usuarioAtualizado 
    ]);



} catch (Exception $e) {
    error_log("Erro em editar.fornecedor.php: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}