<?php
/**************** HEADERS ************************/
session_start();
include_once "../inc/funcoes.inc.php";
require_once "../MVC/Model.php";
require_once "../usuarios/User.class.php";
header_remove('X-Powered-By');
header('Content-Type: application/json');
$user_id = $_SESSION['user_id'];
$user = Usuario::find($user_id);
/*************************************************/

try {
    /**************** VERIFICAÇÕES DE AUTENTICAÇÃO ************************/
    if (!isset($_SESSION["user_id"])) {
        checkLoggedUSer($conn, $_SESSION['user_id']);
        exit;
    }
    /*********************************************************************/

    /**************** VERIFICAÇÕES DE CONEXÃO ************************/
    if ($conn->connect_error) {
        throw new Exception("Falha na conexão com o banco de dados. Tente novamente mais tarde.");
    }
    /*****************************************************************/

    /**************** RECEBE AS INFORMAÇÕES DO FRONT-END ************************/
    $rawData = file_get_contents("php://input");
    if (!$rawData) {
        throw new Exception("Nenhum dado foi recebido para processamento.");
    }

    $data = json_decode($rawData, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Formato de dados inválido. Por favor, verifique os dados enviados.");
    }
    /****************************************************************************/

    /**************** VALIDAÇÕES DOS CAMPOS ************************/
    $camposObrigatorios = ['lote_id', 'lote_codigo', 'dproduto', 'reason'];
    foreach ($camposObrigatorios as $field) {
        if (empty($data[$field])) {
            throw new Exception("O campo '{$field}' é obrigatório para a exclusão.");
        }
    }

    $lote_id = (int) $data['lote_id'];
    if ($user_id <= 0) {
        throw new Exception("ID do lote inválido. Por favor, verifique os dados.");
    }
    /*****************************************************************/

    $conn->begin_transaction();

    /**************** VERIFICAÇÕES DE DEPENDÊNCIAS ************************/
    $check = checkDependencies($conn, 'lote', 'lote_id', $lote_id);
    if (!$check['success']) {
        throw new Exception($check['message']);
    }
    /*****************************************************************/

    /**************** VERIFICAÇÕES DE MOVIMENTAÇÕES ************************/
    $stmtCheckMov = $conn->prepare("SELECT COUNT(*) as total FROM movimentacoes_estoque WHERE lote_id = ?");
    $stmtCheckMov->bind_param("i", $lote_id);
    $stmtCheckMov->execute();
    $result = $stmtCheckMov->get_result();
    $row = $result->fetch_assoc();

    if ($row['total'] > 0) {
        throw new Exception("Este lote possui movimentações no estoque e não pode ser excluído.");
    }
    /***********************************************************************/

    /**************** DELETA O LOTE ************************/
    $exclusao = deleteData($conn, $lote_id, 'lote', "lote_id");
    if (!$exclusao['success']) {
        throw new Exception($exclusao['message'] ?? "Falha ao excluir o lote.");
    }
    /*******************************************************/

    /**************** ATUALIZAR LOTE ************************/
    // Atualizar o estoque com a nova quantidade de lotes
    $stmtSincronizaEstoque = $conn->prepare("
        UPDATE estoque 
        SET estoque_atual = (SELECT COUNT(*) FROM lote)
        WHERE estoque_id = 1
    ");
    $stmtSincronizaEstoque->execute();
    /*******************************************************/

    if (!$conn->commit()) {
        throw new Exception("Falha ao finalizar a operação. Tente novamente.");
    }

    echo json_encode([
        'success' => true,
        'message' => 'Usuário excluído com sucesso',
        'deleted_id' => $lote_id
    ]);

    salvarLog("O usuário ID ({$user->user_id} -  {$user->user_nome}) excluiu o lote: \n\n Lote: {$data['lote_codigo']} \n\n Produto {$data['dproduto']} \n\n Motivo: {$data['reason']}.", Acoes::EXCLUIR_LOTE);

} catch (Exception $e) {
    /**************** ROLLBACK ************************/
    if (isset($conn) && $conn) {
        $conn->rollback();
    }

    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);

    salvarLog("O usuário ID ({$user->user_id} -  {$user->user_nome}) tentou excluir o lote: \n\n Motivo do erro: {$e->getMessage()}", Acoes::EXCLUIR_LOTE);

    exit();
}