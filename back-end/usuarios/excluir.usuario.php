<?php 
session_start();
include_once "../inc/funcoes.inc.php";
configurarSessaoSegura();

header_remove('X-Powered-By');
header('Content-Type: application/json');

try {
    // Verifica autenticação
    if (!isset($_SESSION["user_id"])) {
        throw new Exception("Usuário não autenticado!");
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

    $requiredFields = ['user_id', 'dname', 'reason']; 
    foreach ($requiredFields as $field) {
        if (empty($data[$field])) {
            throw new Exception("O campo $field é obrigatório.");
        }
    }

    // Verifica se o usuário existe
    if (!verificarUsuarioExiste($conn, $data['user_id'])) {
        throw new Exception("Usuário não encontrado.");
    }

    // Executa a exclusão
    $resultado = excluirUsuario($conn, $data['user_id'], $data);
    
    if (!$resultado['success']) {
        throw new Exception($resultado['message']);
    }

    echo json_encode(["success" => true, "message" => "Usuário excluído com sucesso!"]);

} catch (Exception $e) {
    error_log("Erro em excluir.usuario.php: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
    exit();
}