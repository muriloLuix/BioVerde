<?php
ini_set("display_errors", 1);
session_start();
include_once "../inc/funcoes.inc.php";

header('Content-Type: application/json');

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Erro na conexão com o banco de dados: " . $conn->connect_error]));
}

$rawData = file_get_contents("php://input");

if (!$rawData) {
    echo json_encode(["success" => false, "message" => "Erro ao receber os dados."]);
    exit();
}

$data = json_decode($rawData, true);

// Validação básica
if (!isset($data['produto_nome']) || !isset($data['etapas']) || !is_array($data['etapas'])) {
    echo json_encode(["success" => false, "message" => "Dados incompletos ou inválidos."]);
    exit();
}

try {
    $conn->begin_transaction();

    // 1. Criar um novo registro de etapas_producao para o produto
    $stmtProducao = $conn->prepare("INSERT INTO etapas_producao (etapa_nome) VALUES (?)");
    $stmtProducao->bind_param("s", $data['produto_nome']);
    $stmtProducao->execute();
    $producaoId = $conn->insert_id; // Este é o etapa_id para as etapas
    $stmtProducao->close();

    // 2. Inserir todas as etapas ligadas ao novo producaoId
    foreach ($data["etapas"] as $etapa) {
        $stmtEtapa = $conn->prepare("INSERT INTO etapa_ordem 
            (etor_ordem, etor_etapa_nome, etor_responsavel, etor_tempo, etor_insumos, etor_observacoes, producao_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmtEtapa->bind_param(
            "isssssi",
            $etapa["ordem"],
            $etapa["nome_etapa"],
            $etapa["responsavel"],
            $etapa["tempo"],
            $etapa["insumos"],
            $etapa["obs"],
            $producaoId
        );
        $stmtEtapa->execute();
        $stmtEtapa->close();
    }

    $conn->commit();
    echo json_encode(["success" => true, "message" => "Produto e etapas cadastrados com sucesso!"]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "message" => "Erro ao cadastrar etapas: " . $e->getMessage()]);
}
?>
