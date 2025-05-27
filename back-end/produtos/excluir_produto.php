<?php
session_start();
include_once "../inc/funcoes.inc.php";

header_remove('X-Powered-By');
header('Content-Type: application/json');

try {
    // Verificação de autenticação

    if (!isset($_SESSION["user_id"])) {
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

    $produto_id = (int) $data['produto_id'];

    // Início da transação
    $conn->begin_transaction();

    // 1. Deleta o usuário
    $exclusao = deleteData($conn, $produto_id, 'produtos', "produto_id");
    if (!$exclusao['success']) {
        throw new Exception($exclusao['message'] ?? "Falha ao excluir o produto.");
    }

    // Commit da transação
    if (!$conn->commit()) {
        throw new Exception("Falha ao finalizar a operação. Tente novamente.");
    }

    // Resposta de sucesso simplificada para produção
    echo json_encode([
        'success' => true,
        'message' => 'Produto excluído com sucesso',
        'deleted_id' => $produto_id 
    ]);

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

    exit();
}