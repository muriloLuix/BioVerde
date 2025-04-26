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

    // Conexão com o banco (certifica que $conn esteja incluído!)
    if ($conn->connect_error) {
        throw new Exception("Erro na conexão com o banco: " . $conn->connect_error);
    }

    // Recebe os dados
    $rawData = file_get_contents("php://input");
    if (!$rawData) {
        throw new Exception("Erro ao receber os dados.");
    }

    $data = json_decode($rawData, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON inválido: " . json_last_error_msg());
    }

    // Validação dos campos obrigatórios
    $camposObrigatorios = ['produto_nome', 'ordem', 'nome_etapa', 'tempo', 'insumos', 'responsavel', 'obs'];

    foreach ($camposObrigatorios as $campo) {
        if (empty($data[$campo]) && $data[$campo] !== 0) {
            throw new Exception("Campo obrigatório ausente ou vazio: $campo");
        }
    }

    // Atualiza a etapa no banco de dados
    $stmt = $conn->prepare("UPDATE etapas SET nome_etapa = ?, tempo = ?, insumos = ?, responsavel = ?, obs = ? WHERE produto_nome = ? AND ordem = ?");
    if (!$stmt) {
        throw new Exception("Erro ao preparar statement: " . $conn->error);
    }

    $stmt->bind_param(
        "ssssssi",
        $data['nome_etapa'],
        $data['tempo'],
        $data['insumos'],
        $data['responsavel'],
        $data['obs'],
        $data['produto_nome'],
        $data['ordem']
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
