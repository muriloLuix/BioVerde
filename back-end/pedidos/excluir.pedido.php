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

    // Validação dos campos obrigatórios
    $camposObrigatorios = ['dnum_pedido', 'dnome_cliente', 'reason'];
    foreach ($camposObrigatorios as $field) {
        if (empty($data[$field])) {
            throw new Exception("O campo '{$field}' é obrigatório para a exclusão.");
        }
    }

    $user_id = $_SESSION['user_id'];

    $pedido_id = (int)$data['pedido_id'];
    if ($pedido_id <= 0) {
        throw new Exception("ID do pedido inválido. Por favor, verifique os dados.");
    }

    // Início da transação
    $conn->begin_transaction();

    $exclusao = deleteData($conn, $pedido_id, "pedidos", "pedido_id");
    if (!$exclusao['success']) {
        throw new Exception($exclusao['message'] ?? "Falha ao excluir o pedido.");
    }

    // Commit da transação
    if (!$conn->commit()) {
        throw new Exception("Falha ao finalizar a operação. Tente novamente.");
    }

    // Resposta de sucesso simplificada para produção
    echo json_encode([
        'success' => true,
        'message' => 'Pedido excluído com sucesso',
        'deleted_id' => $pedido_id
    ]);

    salvarLog("O usuário ID {$user_id} excluiu o pedido do produto {$data['dnum_pedido']} (Motivo: {$data['reason']})", Acoes::EXCLUIR_PEDIDO);


}catch (Exception $e) {
    // Rollback em caso de erro
    if (isset($conn) && $conn) {
        $conn->rollback();
    }

    error_log("ERRO NA EXCLUSÃO [" . date('Y-m-d H:i:s') . "]: " . $e->getMessage());

    // Resposta de erro simplificada para produção
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'pedido_id' => $pedido_id,
        'reason' => $data['reason'],
        'dnum_pedido' => $data['dnum_pedido'],
    ]);

    salvarLog("O usuário ID {$user_id} tentou excluir o pedido do produto {$data['dnum_pedido']} (Motivo: {$data['reason']})", Acoes::EXCLUIR_CLIENTE, "erro");

    exit();
}

?>