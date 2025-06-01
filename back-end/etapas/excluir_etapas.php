<?php
/**************** HEADERS ************************/
session_start();
include_once "../inc/funcoes.inc.php";
require_once "../MVC/Model.php";
require_once "../usuarios/User.class.php";
require_once "../etapas/Etapa.class.php";
header_remove('X-Powered-By');
header('Content-Type: application/json');
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

    $user_id = $_SESSION['user_id'];
    $user = Usuario::find($user_id);

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
    $camposObrigatorios = ['dstep', 'reason'];
    foreach ($camposObrigatorios as $field) {
        if (empty($data[$field])) {
            throw new Exception("O campo '{$field}' é obrigatório para a exclusão.");
        }
    }
    /*************************************************************/

    /**************** BUSCA O NOME DA ETAPA COM O ID ************************/
    $etapaId = $data['dstep'];
    $buscaEtapaId = $conn->prepare("SELECT etapa_nome FROM etapa_nomes WHERE etapa_nome_id = ?");
    $buscaEtapaId->bind_param("i", $etapaId);
    $buscaEtapaId->execute();
    $resultEtapaId = $buscaEtapaId->get_result();
    $etapa = $resultEtapaId->fetch_assoc();

    if (!$etapa) {
        throw new Exception("Nome da Etapa não encontrado.");
    }

    $nomeEtapa = $etapa['etapa_nome'];

    /**************** SALVA OS DADOS QUE SERÃO EXCLUÍDOS ************************/
    $etor_id = (int)$data['etor_id'];         
    $produto = $data['dproduct'];             
    $motivo = $data['reason'];  
    /**************************************************************************/

    /**************** VERIFICA O ID DA ETAPA ************************/
    if ($etor_id <= 0) {
        throw new Exception("ID da etapa inválido. Por favor, verifique os dados.");
    }
    /***************************************************************/

    $conn->begin_transaction();

    
    /**************** DELETA A ETAPA ************************/
    $exclusao = deleteData($conn, $etor_id, "etapa_ordem", "etor_id");
    if (!$exclusao['success']) {
        throw new Exception($exclusao['message'] ?? "Falha ao excluir a Etapa.");
    }
    
    if (!$conn->commit()) {
        throw new Exception("Falha ao finalizar a operação. Tente novamente.");
    }
    /******************************************************/

    /**************** LOG DE EXCLUSÃO ************************/
    $etapas = Etapa::find($etor_id);

    salvarLog("O usuário ID ({$user->user_id} - {$user->user_name}) excluiu a etapa: ({$etor_id} - {$nomeEtapa}) do produto: {$data['dproduct']}\n\nMotivo: {$motivo}", Acoes::EXCLUIR_ETAPA);
    /******************************************************/
    
    echo json_encode([
        'success' => true,
        'message' => 'Etapa excluída com sucesso',
        'deleted_id' => $etor_id
    ]);

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