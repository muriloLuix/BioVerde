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

    $etapa_nome_id = (int) $data['etapa_nome_id'];

    // Início da transação
    $conn->begin_transaction();

    // Verifica se há etapas que possem esse nome de Etapa
    $stmt = $conn->prepare("SELECT COUNT(*) AS total FROM etapa_ordem WHERE etor_nome_id = ?");
    $stmt->bind_param("i", $etapa_nome_id);
    $stmt->execute();
    $resultado = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if ($resultado['total'] > 0) {
        throw new Exception("Não é possível excluir o nome da Etapa. Existem Etapas que possem ele.");
    }

    // 1. Deleta o usuário
    $exclusao = deleteData($conn, $etapa_nome_id, 'etapa_nomes', "etapa_nome_id");
    if (!$exclusao['success']) {
        throw new Exception($exclusao['message'] ?? "Falha ao excluir o Nome da Etapa.");
    }

    // Commit da transação
    if (!$conn->commit()) {
        throw new Exception("Falha ao finalizar a operação. Tente novamente.");
    }

    // Resposta de sucesso simplificada para produção
    echo json_encode([
        'success' => true,
        'message' => 'Nome da Etapa excluído com sucesso',
        'deleted_id' => $etapa_nome_id 
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