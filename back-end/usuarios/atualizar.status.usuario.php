<?php
/**************** HEADERS ************************/
session_start();
include_once "../inc/funcoes.inc.php";
header_remove('X-Powered-By');
header('Content-Type: application/json');
verificarAutenticacao($conn, $_SESSION['user_id']);
/*************************************************/

try {
    /**************** RECEBE AS INFORMAÇÕES DO FRONT-END ************************/
    $rawData = file_get_contents("php://input");
    $data = json_decode($rawData, true);
    if (!$data || !isset($data['user_id'], $data['estaAtivo'])) {
        throw new Exception("Dados inválidos.");
    }

    $userId = (int) $data['user_id'];
    $novoStatus = (int) $data['estaAtivo'];
    /**************************************************************************/

    /**************** VERIFICA SE O USUÁRIO EXISTE ************************/

    if (!verifyExist($conn, $userId, "user_id", "usuarios")) {
        throw new Exception("Usuário não encontrado.");
    }

    /**********************************************************************/

    $stmt = $conn->prepare("UPDATE usuarios SET estaAtivo = ?, force_logout = 1 WHERE user_id = ?");
    $stmt->bind_param("ii", $novoStatus, $userId);
    $stmt->execute();
    $stmt->close();

    echo json_encode([
        "success" => true,
        "message" => "Status atualizado com sucesso!"
    ]);
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
} finally {
    if (isset($conn))
        $conn->close();
}
