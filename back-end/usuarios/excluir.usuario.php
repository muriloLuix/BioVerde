<?php 
session_start();
include_once "../inc/funcoes.inc.php";
configurarSessaoSegura();

header_remove('X-Powered-By');
header('Content-Type: application/json');

try {
    if (!isset($_SESSION["user_id"])) {
        throw new Exception("Usuário não autenticado!");
    }

    if ($conn->connect_error) {
        throw new Exception("Erro na conexão com o banco: " . $conn->error);
    }

    $rawData = file_get_contents("php://input");
    if (!$rawData) {
        throw new Exception("Erro ao receber os dados.");
    }

    $data = json_decode($rawData, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON inválido: " . json_last_error_msg());
    }

    $requiredFields = ['user_id', 'dname', 'reason'];
    foreach ($requiredFields as $field) {
        if (empty($data[$field])) {
            throw new Exception("O campo $field é obrigatório.");
        }
    }

    $user_id = (int)$data['user_id'];
    if ($user_id <= 0) {
        throw new Exception("ID do usuário inválido");
    }

    $conn->begin_transaction();

    // 1. Registra a exclusão
    $registro = registrarExclusaoUsuario($conn, $user_id, $data);
    if (!$registro['success']) {
        throw new Exception("Falha ao registrar exclusão: " . ($registro['message'] ?? 'Erro desconhecido'));
    }

    // 2. Deleta o usuário
    $exclusao = deletarUsuario($conn, $user_id);
    if (!$exclusao['success']) {
        throw new Exception("Falha ao excluir usuário: " . ($exclusao['message'] ?? 'Erro desconhecido'));
    }

    // Commit da transação
    if (!$conn->commit()) {
        throw new Exception("Erro ao finalizar transação: " . $conn->error);
    }

    $finalCheck = $conn->query("
        SELECT 
            (SELECT COUNT(*) FROM usuarios WHERE user_id = $user_id) as user_exists,
            (SELECT COUNT(*) FROM usuarios_excluidos WHERE usuex_id = " . $registro['insert_id'] . ") as log_exists
    ")->fetch_assoc();

    echo json_encode([
        'success' => true,
        'message' => 'Usuário excluído com sucesso',
        'debug' => [
            'registro_exclusao' => $registro,
            'exclusao_usuario' => $exclusao,
            'verificacao_final' => $finalCheck,
            'timestamp' => date('Y-m-d H:i:s')
        ]
    ]);

} catch (Exception $e) {
    $conn->rollback();
    error_log("ERRO NA EXCLUSÃO: " . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'debug' => [
            'error_info' => $conn->error ?? null,
            'timestamp' => date('Y-m-d H:i:s')
        ]
    ]);
    exit();
}