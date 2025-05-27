<?php
ini_set("display_errors", 1);
session_start();

include_once "../inc/funcoes.inc.php";

header_remove('X-Powered-By');
header('Content-Type: application/json');

try {
    // Verifica autenticação
    if (!isset($_SESSION["user_id"])) {
        checkLoggedUSer($conn, $_SESSION['user_id']);
        exit;
    }

    // Verifica conexão com o banco
    if ($conn->connect_error) {
        throw new Exception("Erro na conexão com o banco: " . $conn->connect_error);
    }

    // Processa os dados de entrada
    $rawData = file_get_contents("php://input");
    if (!$rawData) {
        throw new Exception("Erro ao receber os dados.");
    }

    $data = json_decode($rawData, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON inválido: " . json_last_error_msg());
    }

    // Verifica se o produto existe
    if (!verifyExist($conn, $data['produto_id'], 'produto_id', 'produtos')) {
        throw new Exception('Produto não encontrado');
    }

    // Atualiza produto
    $camposAtualizados = [
        'produto_nome' => $data['produto_nome'],
    ];

    $resultado = updateData($conn, "produtos", $camposAtualizados, $data['produto_id'], "produto_id");
    
    if (!$resultado['success']) {
        throw new Exception($resultado['message'] ?? "Erro ao atualizar produto");
    }

    // Retorna sucesso
    echo json_encode([
        'success' => true,
        'message' => 'Produto atualizado com sucesso'
    ]);

} catch (Exception $e) {
    error_log("Erro em editar_produto.php: " . $e->getMessage());
    echo json_encode([
        "success" => false, 
        "message" => $e->getMessage()
    ]);
}