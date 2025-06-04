<?php
ini_set("display_errors", 1);
session_start();
include_once "../inc/funcoes.inc.php";
header_remove('X-Powered-By');
header('Content-Type: application/json');

try {
    // Verifica autenticação
    if (!isset($_SESSION["user_id"])) {
        checkLoggedUser($conn, $_SESSION['user_id']);
        exit;
    }

    // Recebe JSON do front
    $rawData = file_get_contents("php://input");
    $data = json_decode($rawData, true);
    if (!$data || !isset($data['cliente_id'], $data['estaAtivo'])) {
        throw new Exception("Dados inválidos.");
    }

    $clienteId = (int)$data['cliente_id'];
    $novoStatus = (int)$data['estaAtivo'];

    if (!verifyExist($conn, $clienteId, "cliente_id", "clientes")) {
        throw new Exception("cliente não encontrado.");
    }

    $stmt = $conn->prepare("UPDATE clientes SET estaAtivo = ? WHERE cliente_id = ?");
    $stmt->bind_param("ii", $novoStatus, $clienteId);
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
    if (isset($conn)) $conn->close();
}
