<?php
session_start();
include_once "../inc/funcoes.inc.php";
require_once "../MVC/Model.php";
require_once "../usuarios/User.class.php";

header('Content-Type: application/json');

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "message" => "Usuário não autenticado!"]);
    exit();
}

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Erro na conexão com o banco de dados: " . $conn->connect_error]));
}

$user_id = $_SESSION['user_id'];
$user = Usuario::find($user_id);

$rawData = file_get_contents("php://input");
if (!$rawData) {
    echo json_encode(["success" => false, "message" => "Erro ao receber os dados."]);
    exit();
}

$data = json_decode($rawData, true);

if (!isset($data['etapa_id']) || !isset($data['etapas']) || !is_array($data['etapas'])) {
    echo json_encode(["success" => false, "message" => "Dados incompletos ou inválidos."]);
    exit();
}

try {
    $conn->begin_transaction();
    $etapaIdProducao = $data['etapa_id'];
    $primeiraEtapaId = null;

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
            $etapaIdProducao
        );
        $stmtEtapa->execute();
        $etor_id = $conn->insert_id;
        $stmtEtapa->close();

        if ($etapa["ordem"] == 1) {
            $primeiraEtapaId = $etor_id;
        }
    }

    // Atualiza campo etor_id da produção
    if ($primeiraEtapaId !== null) {
        $stmtUpdate = $conn->prepare("UPDATE etapas_producao SET etor_id = ? WHERE etapa_id = ?");
        $stmtUpdate->bind_param("ii", $primeiraEtapaId, $etapaIdProducao);
        $stmtUpdate->execute();
        $stmtUpdate->close();
    }

    $conn->commit();

    $etapasStr = formatarEtapasLog($data['etapas']);
    SalvarLog("Usuário ({$user->user_id} - {$user->user_nome}) cadastrou etapas para o produto {$etapaIdProducao}:\n\n{$etapasStr}", Acoes::CADASTRAR_ETAPA, "sucesso");

    echo json_encode(["success" => true, "message" => "Etapas cadastradas com sucesso!"]);

} catch (Exception $e) {
    $conn->rollback();
    $etapasStr = formatarEtapasLog($data['etapas']);
    SalvarLog("Erro ao cadastrar etapas para o produto {$etapaIdProducao}.\nMotivo: {$e->getMessage()}\nEtapas:\n{$etapasStr}", Acoes::CADASTRAR_ETAPA, "erro");
    echo json_encode(["success" => false, "message" => "Erro ao cadastrar etapas: " . $e->getMessage()]);
}

$conn->close();
