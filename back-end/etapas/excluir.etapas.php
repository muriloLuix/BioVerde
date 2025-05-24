<?php
/**************** HEADERS ************************/
session_start();
include_once "../inc/funcoes.inc.php";
require_once "../MVC/Model.php";
require_once "../usuarios/User.class.php";
require_once "../etapas/Etapas.class.php";
header_remove('X-Powered-By');
header('Content-Type: application/json');
$user_id = $_SESSION['user_id'];
$user = Usuario::find($user_id);
/*************************************************/

try {
    /**************** VERIFICA A AUTENTICAÇÃO ************************/
    if (!isset($_SESSION["user_id"])) {
        checkLoggedUSer($conn, $_SESSION['user_id']);
        exit;
    }
    /*************************************************************/

    /**************** VERIFICA A CONEXÃO COM O BANCO ************************/
    if ($conn->connect_error) {
        throw new Exception("Falha na conexão com o banco de dados. Tente novamente mais tarde.");
    }
    /***********************************************************************/

    /**************** RECEBE AS INFORMAÇÕES DO FRONT-END************************/
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
    $camposObrigatorios = ['dproduct', 'dstep', 'reason'];
    foreach ($camposObrigatorios as $field) {
        if (empty($data[$field])) {
            throw new Exception("O campo '{$field}' é obrigatório para a exclusão.");
        }
    }
    /*************************************************************/

    /**************** VERIFICA O ID DA ETAPA ************************/
    $etor_id = (int)$data['etor_id'];
    if ($etor_id <= 0) {
        throw new Exception("ID da etapa inválido. Por favor, verifique os dados.");
    }
    /***************************************************************/

    $conn->begin_transaction();

    /**************** DELETA A ETAPA ************************/
    $exclusao = deleteData($conn, $etor_id, "etapa_ordem", "etor_id");
    if (!$exclusao['success']) {
        throw new Exception($exclusao['message'] ?? "Falha ao excluir o usuário.");
    }

    if (!$conn->commit()) {
        throw new Exception("Falha ao finalizar a operação. Tente novamente.");
    }
    /******************************************************/

    /**************** LOG DE EXCLUSÃO ************************/
    echo json_encode([
        'success' => true,
        'message' => 'Usuário excluído com sucesso',
        'deleted_id' => $etor_id
    ]);

    $etapas = Etapa::find($etor_id);

    salvarLog("O usuário ID ({$user->user_id} - {$user->user_name}) excluiu a etapa: ({$etapas->etor_id} - {$etapas->nome_etapa}) do produto: {$data['dproduct']}\n\nMotivo: {$data['reason']}", Acoes::EXCLUIR_ETAPA);


} catch
(Exception $e) {
    /**************** ROLLBACK ************************/
    if (isset($conn) && $conn) {
        $conn->rollback();
    }

    error_log("ERRO NA EXCLUSÃO [" . date('Y-m-d H:i:s') . "]: " . $e->getMessage());

    /**************** LOG DE ERRO ************************/
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'etor_id' => $etor_id,
        'reason' => $data['reason'],
        'dproduct' => $data['dproduct'],
    ]);

    salvarLog("O usuário ID ({$user->user_id} - {$user->user_name}) tentou excluir a etapa. \n\nErro: {$e->getMessage()}", Acoes::EXCLUIR_ETAPA, "erro");

    exit();
}