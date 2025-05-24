<?php
session_start();
include_once "../inc/funcoes.inc.php";
require_once "../MVC/Model.php";
require_once "../usuarios/User.class.php";

header_remove('X-Powered-By');
header('Content-Type: application/json');

try {
    // 1. Verificação de autenticação
    if (!isset($_SESSION["user_id"])) {
        checkLoggedUser($conn, $_SESSION['user_id']);
        exit;
    }
    $user_id = (int) $_SESSION['user_id'];
    $user = Usuario::find($user_id);
    // 2. Verificação da conexão com o banco
    if ($conn->connect_error) {
        throw new Exception("Falha na conexão com o banco de dados. Tente novamente mais tarde.");
    }

    // 3. Processamento dos dados de entrada
    $rawData = file_get_contents("php://input");
    if (!$rawData) {
        throw new Exception("Nenhum dado foi recebido para processamento.");
    }

    $data = json_decode($rawData, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Formato de dados inválido. Por favor, verifique os dados enviados.");
    }

    // 4. Validação dos campos obrigatórios
    $camposObrigatorios = ['fornecedor_id', 'dnome_empresa', 'reason'];
    foreach ($camposObrigatorios as $field) {
        if (empty($data[$field])) {
            throw new Exception("O campo '{$field}' é obrigatório para a exclusão.");
        }
    }

    $fornecedor_id = (int) $data['fornecedor_id'];
    if ($fornecedor_id <= 0) {
        throw new Exception("ID do fornecedor inválido. Por favor, verifique os dados.");
    }

    // 5. Início da transação
    $conn->begin_transaction();

    // 6. Verifica dependências na tabela produtos
    //    (supondo que getDependencyMap() em funcoes.inc.php tenha 'fornecedores' => ['produtos'=>'id_fornecedor'])
    $check = checkDependencies($conn, 'fornecedores', 'fornecedor_id', $fornecedor_id);
    if (!$check['success']) {
        throw new Exception($check['message']);
    }

    // 7. Realiza a exclusão
    $exclusao = deleteData($conn, $fornecedor_id, 'fornecedores', 'fornecedor_id');
    if (!$exclusao['success']) {
        throw new Exception($exclusao['message'] ?? "Falha ao excluir o fornecedor.");
    }

    // 8. Commit da transação
    if (!$conn->commit()) {
        throw new Exception("Falha ao finalizar a operação. Tente novamente.");
    }

    // 9. Resposta de sucesso
    echo json_encode([
        'success'    => true,
        'message'    => 'Fornecedor excluído com sucesso',
        'deleted_id' => $fornecedor_id
    ]);

    salvarLog(
        "O usuário, {$user->user_id} - ({$user->user_nome}) excluiu o fornecedor “{$data['dnome_empresa']}” (Motivo: {$data['reason']})",
        Acoes::EXCLUIR_FORNECEDOR
    );

} catch (Exception $e) {
    // Rollback em caso de erro
    if (isset($conn) && $conn) {
        $conn->rollback();
    }

    error_log("ERRO NA EXCLUSÃO [" . date('Y-m-d H:i:s') . "]: " . $e->getMessage());

    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);

    salvarLog(
        "O usuário, {$user->user_id} - ({$user->user_nome}), tentou excluir o fornecedor {$fornecedor_id} | Motivo: {$data['reason']} ",
        Acoes::EXCLUIR_FORNECEDOR,
        "erro"
    );

    exit();
}
