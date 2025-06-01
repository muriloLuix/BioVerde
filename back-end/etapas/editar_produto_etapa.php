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
    if (!verifyExist($conn, $data['produto_id'], 'etapa_id', 'etapas_producao')) {
        throw new Exception('Produto não encontrado');
    }

    // Verifica se já existe um produto com o mesmo nome (exceto o atual)
    $verificaNome = $conn->prepare("SELECT etapa_id FROM etapas_producao WHERE etapa_produtoNome = ? AND etapa_id != ?");
    $verificaNome->bind_param("si", $data['produto_nome'], $data['produto_id']);
    $verificaNome->execute();
    $resultadoNome = $verificaNome->get_result();

    if ($resultadoNome->num_rows > 0) {
        throw new Exception("Já existe um produto com o nome informado.");
    }

    // Atualiza produto
    $camposAtualizados = [
        'etapa_produtoNome' => $data['produto_nome'],
    ];

    $resultado = updateData($conn, "etapas_producao", $camposAtualizados, $data['produto_id'], "etapa_id");
    
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