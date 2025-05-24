<?php
/**************** HEADERS ************************/
session_start();
include_once "../inc/funcoes.inc.php";
require_once "../MVC/Model.php";
require_once "../usuarios/User.class.php";
header_remove('X-Powered-By');
header('Content-Type: application/json');
$user_id = (int)$_SESSION['user_id'];
$user = Usuario::find($user_id);
/*************************************************/

try {
    /**************** VERIFICA AUTENTICAÇÃO ************************/
    if (!isset($_SESSION["user_id"])) {
        checkLoggedUser($conn, $_SESSION['user_id']);
        exit;
    }
    /*************************************************/

    /**************** VERIFICA CONEXÃO COM O BANCO ************************/
    if ($conn->connect_error) {
        throw new Exception("Falha na conexão com o banco de dados. Tente novamente mais tarde.");
    }
    /*********************************************************************/

    /**************** RECEBE AS INFORMAÇÕES DO FRONT-END ************************/
    $rawData = file_get_contents("php://input");
    if (!$rawData) {
        throw new Exception("Nenhum dado foi recebido para processamento.");
    }

    $data = json_decode($rawData, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Formato de dados inválido. Por favor, verifique os dados enviados.");
    }
    /***************************************************************************/

    /**************** VALIDAÇÃO DOS CAMPOS ************************/
    $camposObrigatorios = ['fornecedor_id', 'dnome_empresa', 'reason'];
    foreach ($camposObrigatorios as $field) {
        if (empty($data[$field])) {
            throw new Exception("O campo '{$field}' é obrigatório para a exclusão.");
        }
    }

    $fornecedor_id = (int)$data['fornecedor_id'];
    if ($fornecedor_id <= 0) {
        throw new Exception("ID do fornecedor inválido. Por favor, verifique os dados.");
    }
    /*********************************************************************/

    $conn->begin_transaction();

    /**************** VERIFICA DEPENDÊNCIAS DO FORNECEDOR (supondo que getDependencyMap() em funcoes.inc.php tenha 'fornecedores' => ['produtos'=>'id_fornecedor'])) ************************/
    $check = checkDependencies($conn, 'fornecedores', 'fornecedor_id', $fornecedor_id);
    if (!$check['success']) {
        throw new Exception($check['message']);
    }

    /**************** EXCLUSÃO DO FORNECEDOR ************************/
    $exclusao = deleteData($conn, $fornecedor_id, 'fornecedores', 'fornecedor_id');
    if (!$exclusao['success']) {
        throw new Exception($exclusao['message'] ?? "Falha ao excluir o fornecedor.");
    }
    /*********************************************************************/

    /**************** EXCLUSÃO DE DADOS RELACIONADOS ************************/
    if (!$conn->commit()) {
        throw new Exception("Falha ao finalizar a operação. Tente novamente.");
    }
    /*********************************************************************/

    echo json_encode([
        'success' => true,
        'message' => 'Fornecedor excluído com sucesso',
        'deleted_id' => $fornecedor_id
    ]);

    salvarLog(
        "O usuário ({$user->user_id} - {$user->user_nome}) excluiu o fornecedor ({$data['dnome_empresa']}). \n\n(Motivo: {$data['reason']})",
        Acoes::EXCLUIR_FORNECEDOR
    );

} catch (Exception $e) {
    /**************** TRATAMENTO DE ERROS ************************/
    if (isset($conn) && $conn) {
        $conn->rollback();
    }

    error_log("ERRO NA EXCLUSÃO [" . date('Y-m-d H:i:s') . "]: " . $e->getMessage());

    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
    /*********************************************************************/

    salvarLog(
        "O usuário ({$user->user_id} - {$user->user_nome}), tentou excluir o fornecedor.\n\nErro: {$e->getMessage()}",
        Acoes::EXCLUIR_FORNECEDOR,
        "erro"
    );

    exit();
}
