<?php
ini_set("display_errors", 1);
session_start();

include_once "../inc/funcoes.inc.php";

header_remove('X-Powered-By');
header('Content-Type: application/json');

try {
    if (!isset($_SESSION["user_id"])) {
        throw new Exception("Usuário não autenticado.");
    }

    // Verifica a conexão
    if ($conn->connect_error) {
        throw new Exception("Erro na conexão com o banco: " . $conn->connect_error);
    }

    // Recebe o JSON
    $rawData = file_get_contents("php://input");
    if (!$rawData) {
        throw new Exception("Erro ao receber os dados.");
    }

    $data = json_decode($rawData, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON inválido: " . json_last_error_msg());
    }

    // var_dump($data);
    // exit;

    // Verifica se o etor_id foi enviado
    if (empty($data['etor_id'])) {
        throw new Exception("ID da etapa não informado.");
    }

    // Validação dos campos obrigatórios
    $camposObrigatorios = ['etor_etapa_nome', 'etor_responsavel', 'etor_tempo', 'etor_insumos', 'etor_observacoes'];
    foreach ($camposObrigatorios as $campo) {
        if (!isset($data[$campo])) {
            throw new Exception("Campo obrigatório ausente: $campo");
        }
    }

    // Atualiza a etapa_ordem
    $stmt = $conn->prepare("UPDATE etapa_ordem 
        SET etor_etapa_nome = ?, 
            etor_tempo = ?, 
            etor_insumos = ?, 
            etor_responsavel = ?, 
            etor_observacoes = ? 
        WHERE etor_id = ?");

    if (!$stmt) {
        throw new Exception("Erro ao preparar o statement: " . $conn->error);
    }

    $stmt->bind_param(
        "sssssi",
        $data['etor_etapa_nome'],
        $data['etor_tempo'],
        $data['etor_insumos'],
        $data['etor_responsavel'],
        $data['etor_observacoes'],
        $data['etor_id']
    );

    if (!$stmt->execute()) {
        throw new Exception("Erro ao executar atualização: " . $stmt->error);
    }

    echo json_encode([
        "success" => true,
        "message" => "Etapa atualizada com sucesso!"
    ]);

} catch (Exception $e) {
    error_log("Erro em editar.etapa.php: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
