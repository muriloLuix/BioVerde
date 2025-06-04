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
    if (!$data || !isset($data['fornecedor_id'], $data['estaAtivo'])) {
        throw new Exception("Dados inválidos.");
    }

    $fornecedorId = (int)$data['fornecedor_id'];
    $novoStatus = (int)$data['estaAtivo'];

    if (!verifyExist($conn, $fornecedorId, "fornecedor_id", "fornecedores")) {
        throw new Exception("Fornecedor não encontrado.");
    }

    $stmt = $conn->prepare("UPDATE fornecedores SET estaAtivo = ? WHERE fornecedor_id = ?");
    $stmt->bind_param("ii", $novoStatus, $fornecedorId);
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
