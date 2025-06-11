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

    // Verifica se o cargo existe
    if (!verifyExist($conn, $data['etapa_nome_id'], 'etapa_nome_id', 'etapa_nomes')) {
        throw new Exception('Nome de Etapa não encontrado');
    }

    // Atualiza cargo
    $camposAtualizados = [
        'etapa_nome' => $data['etapa_nome'],
    ];

    $resultado = updateData($conn, "etapa_nomes", $camposAtualizados, $data['etapa_nome_id'], "etapa_nome_id");
    
    if (!$resultado['success']) {
        throw new Exception($resultado['message'] ?? "Erro ao atualizar Nome de Etapa");
    }

    // Retorna sucesso
    echo json_encode([
        'success' => true,
        'message' => 'Nome de Etapa atualizado com sucesso'
    ]);

} catch (Exception $e) {
    error_log("Erro em editar_nome_etapa.php: " . $e->getMessage());
    echo json_encode([
        "success" => false, 
        "message" => $e->getMessage()
    ]);
}