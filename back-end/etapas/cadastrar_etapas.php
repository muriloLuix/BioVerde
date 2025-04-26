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

// Validação dos dados recebidos
if (!isset($data['produto_nome']) || !isset($data['etapas']) || !is_array($data['etapas'])) {
    echo json_encode(["success" => false, "message" => "Dados incompletos ou inválidos."]);
    exit();
}

try {
    $conn->begin_transaction();

    // 1. Inserir um novo produto na etapas_producao
    $stmtProducao = $conn->prepare("INSERT INTO etapas_producao (etapa_nome) VALUES (?)");
    $stmtProducao->bind_param("s", $data['produto_nome']);
    $stmtProducao->execute();
    $producaoId = $conn->insert_id; // ID gerado para o novo produto (etapa_id)
    $stmtProducao->close();

    $primeiraEtapaId = null;

    // 2. Inserir as etapas ligadas a esse novo producaoId
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
        $etapaId = $conn->insert_id;
        $stmtEtapa->close();

        // Se for a primeira etapa (ordem == 1), guardar o ID
        if ($etapa["ordem"] == 1) {
            $primeiraEtapaId = $etapaId;
        }
    }

    // 3. Atualizar a etapas_producao com o ID da primeira etapa
    if ($primeiraEtapaId !== null) {
        $stmtUpdate = $conn->prepare("UPDATE etapas_producao SET etor_id = ? WHERE etapa_id = ?");
        $stmtUpdate->bind_param("ii", $primeiraEtapaId, $producaoId);
        $stmtUpdate->execute();
        $stmtUpdate->close();
    }

    $conn->commit();
    echo json_encode(["success" => true, "message" => "Produto e etapas cadastrados com sucesso!"]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "message" => "Erro ao cadastrar etapas: " . $e->getMessage()]);
}

$conn->close();
?>