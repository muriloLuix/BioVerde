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
    
    // 1. Inserir na tabela etapas_producao
    $stmtProducao = $conn->prepare("INSERT INTO etapas_producao (etapa_nome, produto_id) VALUES (?, ?)");
    $stmtProducao->bind_param("si", $data['produto_nome'], $data['produto_id']); // Assumindo que você envia o produto_id
    $stmtProducao->execute();
    $producaoId = $conn->insert_id;
    $stmtProducao->close();
    
    // 2. Inserir etapas na tabela etapa_ordem
    foreach ($data["etapas"] as $etapa) {
        $stmtEtapa = $conn->prepare("INSERT INTO etapa_ordem 
                                   (etor_etapa_nome, etor_responsavel, etor_tempo, etor_insumos, 
                                   etor_observacoes, producao_id) 
                                   VALUES (?, ?, ?, ?, ?, ?)");
        $stmtEtapa->bind_param(
            "sssssi", 
            $etapa["nome_etapa"],
            $etapa["responsavel"],
            $etapa["tempo"],
            $etapa["insumos"],
            $etapa["obs"],
            $producaoId // Vinculando à produção
        );
        $stmtEtapa->execute();
        $etapaId = $conn->insert_id;
        
        // 3. Atualizar a primeira etapa na tabela etapas_producao (se necessário)
        if ($etapa["ordem"] == 1) {
            $stmtUpdate = $conn->prepare("UPDATE etapas_producao SET etor_id = ? WHERE etapa_id = ?");
            $stmtUpdate->bind_param("ii", $etapaId, $producaoId);            
            $stmtUpdate->execute();
            $stmtUpdate->close();
        }
        
        $stmtEtapa->close();
    }
    
    $conn->commit();
    echo json_encode(["success" => true, "message" => "Etapas cadastradas com sucesso!"]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "message" => "Erro ao cadastrar etapas: " . $e->getMessage()]);
}