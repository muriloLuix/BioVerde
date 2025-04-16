<?php 
ini_set("display_errors", 1);
session_start();

include_once "../inc/funcoes.inc.php";

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

    // Verifica se o cliente existe
    if (!verificarClienteExiste($conn, $data['cliente_id'])) {
        throw new Exception("Cliente não encontrado.");
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
    $resultado = atualizarCliente($conn, $data['cliente_id'], $data);
    if (!$resultado['success']) {
        throw new Exception($resultado['message'] ?? "Erro ao atualizar cliente");
    }

    $usuarioAtualizado = buscarClientePorId($conn, $data['cliente_id']);

    echo json_encode([
        "success" => true,
        "message" => "Cliente atualizado com sucesso!",
        "usuario" => $usuarioAtualizado
    ]);

} catch (Exception $e) {
    error_log("Erro em editar.cliente.php: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}