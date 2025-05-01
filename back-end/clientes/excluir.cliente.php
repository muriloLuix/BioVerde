<?php 
session_start();
include_once "../inc/funcoes.inc.php";

header_remove('X-Powered-By');
header('Content-Type: application/json');

try {
    // Verificação de autenticação

    if(!isset($_SESSION["user_id"])) {
        checkLoggedUSer($conn, $_SESSION['user_id']);
        exit;
    }

    // Verificação da conexão com o banco
    if ($conn->connect_error) {
        throw new Exception("Falha na conexão com o banco de dados. Tente novamente mais tarde.");
    }

    // Processamento dos dados de entrada
    $rawData = file_get_contents("php://input");
    if (!$rawData) {
        throw new Exception("Nenhum dado foi recebido para processamento.");
    }

    $data = json_decode($rawData, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Formato de dados inválido. Por favor, verifique os dados enviados.");
    }

    // Validação dos campos obrigatórios
    $camposObrigatorios = ['cliente_id', 'dnome_cliente', 'reason'];
    foreach ($camposObrigatorios as $field) {
        if (empty($data[$field])) {
            throw new Exception("O campo '{$field}' é obrigatório para a exclusão.");
        }
    }

    $user_id = $_SESSION['user_id'];

    $cliente_id = (int)$data['cliente_id'];
    if ($user_id <= 0) {
        throw new Exception("ID do fornecedor inválido. Por favor, verifique os dados.");
    }

    // Início da transação
    $conn->begin_transaction();

    $camposExclusao = [
        'cliex_excluido' => $data['dnome_cliente'],
        'cliex_exclusao' => $user_id,
        'cliex_motivo_exclusao' => $data['reason'],
    ];

    // 1. Deleta o usuário
    $exclusao = deleteData($conn, $cliente_id, "clientes", "cliente_id");
    if (!$exclusao['success']) {
        throw new Exception($exclusao['message'] ?? "Falha ao excluir o usuário.");
    }

    // Commit da transação
    if (!$conn->commit()) {
        throw new Exception("Falha ao finalizar a operação. Tente novamente.");
    }

    // Resposta de sucesso simplificada para produção
    echo json_encode([
        'success' => true,
        'message' => 'Usuário excluído com sucesso',
        'deleted_id' => $cliente_id // Envia o ID do usuário excluído
    ]);

    salvarLog($conn, "O usuário, ID: {$user_id}, excluiu o cliente, Nome: {$data['dnome_cliente']} | Motivo: {$data['reason']}", "Exclusão de cliente", "sucesso", $_SESSION['user_id']);


} catch (Exception $e) {
    // Rollback em caso de erro
    if (isset($conn) && $conn) {
        $conn->rollback();
    }
    
    error_log("ERRO NA EXCLUSÃO [" . date('Y-m-d H:i:s') . "]: " . $e->getMessage());
    
    // Resposta de erro simplificada para produção
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);

    salvarLog($conn, "O usuário, ID: {$user_id}, tentou excluir o cliente, Nome: {$data['dnome_cliente']} | Motivo: {$data['reason']}", "Exclusão de cliente", "erro", $_SESSION['user_id']);

    exit();
}


?>