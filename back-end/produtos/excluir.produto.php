<?php
session_start();
include_once "../inc/funcoes.inc.php";
require_once "../MVC/Model.php";
require_once "../usuarios/User.class.php";
require_once "../produtos/Produtos.class.php";

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
    $camposObrigatorios = ['produto_id', 'dnome_produto', 'reason'];
    foreach ($camposObrigatorios as $field) {
        if (empty($data[$field])) {
            throw new Exception("O campo '{$field}' é obrigatório para a exclusão.");
        }
    }

    $user_id = $_SESSION['user_id'];
    $user = Usuario::find($user_id);

    $produto_id = (int)$data['produto_id'];
    if ($user_id <= 0) {
        throw new Exception("ID do fornecedor inválido. Por favor, verifique os dados.");
    }

    // Início da transação
    $conn->begin_transaction();

    $check = checkDependencies($conn, 'produtos', 'produto_id', $produto_id);
    if (!$check['success']) {
        throw new Exception($check['message']);
    }

    $produto = Produtos::find($produto_id);

    // 1. Deleta o usuário
    $exclusao = deleteData($conn, $produto_id, 'produtos', "produto_id");
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
        'deleted_id' => $produto_id
    ]);

    salvarLog("O usuário, {$user->user_id} - ({$user->user_nome}), excluiu o produto ({$produto->produto_nome} - {$produto->produto_id}) | Motivo: {$data['reason']}", Acoes::EXCLUIR_PRODUTO);

} catch (Exception $e) {
    // Rollback em caso de erro
    if (isset($conn) && $conn) {
        $conn->rollback();
    }

    $produto = Produtos::find($produto_id);

    // Resposta de erro simplificada para produção
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);

    salvarLog("O usuário, {$user->user_id} - ({$user->user_nome}), tentou excluir o produto ({$produto->produto_nome} - {$produto->produto_id}) | Motivo: {$data['reason']}", Acoes::EXCLUIR_PRODUTO, "erro");

    exit();
}