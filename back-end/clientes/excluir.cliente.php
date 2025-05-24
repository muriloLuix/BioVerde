<?php
/**************** HEADERS ************************/
session_start();
include_once "../inc/funcoes.inc.php";
require_once "../MVC/Model.php";
require_once "../usuarios/User.class.php";
header_remove('X-Powered-By');
header('Content-Type: application/json');
/************************************************/

try {
    /**************** VERIFICA A AUTENTICAÇÃO ************************/
    if (!isset($_SESSION["user_id"])) {
        checkLoggedUSer($conn, $_SESSION['user_id']);
        exit;
    }
    /****************************************************************/

    /**************** VERIFICA A CONEXÃO COM O BANCO ************************/
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
    /************************************************************************/

    /**************** VALIDAÇÃO DOS DADOS ************************/
    $camposObrigatorios = ['cliente_id', 'dnome_cliente', 'reason'];
    foreach ($camposObrigatorios as $field) {
        if (empty($data[$field])) {
            throw new Exception("O campo '{$field}' é obrigatório para a exclusão.");
        }
    }

    $user_id = $_SESSION['user_id'];

    $cliente_id = (int)$data['cliente_id'];
    if ($cliente_id <= 0) {
        throw new Exception("ID do cliente inválido. Por favor, verifique os dados.");
    }
    /**********************************************************/

    $conn->begin_transaction();

    /**************** DELETA O USUARIO / VERIFICA DEPENDENCIAS ************************/
    $check = checkDependencies($conn, 'clientes', 'cliente_id', $cliente_id);
    if (!$check['success']) {
        throw new Exception($check['message']);
    }

    $exclusao = deleteData($conn, $cliente_id, "clientes", "cliente_id");
    if (!$exclusao['success']) {
        throw new Exception($exclusao['message'] ?? "Falha ao excluir o cliente.");
    }
    /**********************************************************************************/

    /**************** COMMIT DA TRANSAÇÃO ************************/
    if (!$conn->commit()) {
        throw new Exception("Falha ao finalizar a operação. Tente novamente.");
    }
    /**********************************************************/

    echo json_encode([
        'success' => true,
        'message' => 'Usuário excluído com sucesso',
        'deleted_id' => $cliente_id
    ]);

    $user = Usuario::find($user_id);

    salvarLog("O usuário ID ({$user->user_id} -  {$user->user_nome}) excluiu o cliente {$data['dnome_cliente']} (Motivo: {$data['reason']})", Acoes::EXCLUIR_CLIENTE);


} catch (Exception $e) {

    /**************** ROLLBACK ************************/
    if (isset($conn) && $conn) {
        $conn->rollback();
    }

    error_log("ERRO NA EXCLUSÃO [" . date('Y-m-d H:i:s') . "]: " . $e->getMessage());
    /**************************************************/

    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);

    salvarLog("O usuário ID ({$user->user_id} -  {$user->user_nome}) tentou excluir o cliente {$data['dnome_cliente']} (Motivo: {$data['reason']}). Motivo do erro: {$e->getMessage()}", Acoes::EXCLUIR_CLIENTE, "erro");

    exit();
}


?>