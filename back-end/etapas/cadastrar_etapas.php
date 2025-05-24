<?php
/**************** HEADERS ************************/
session_start();
include_once "../inc/funcoes.inc.php";
require_once "../MVC/Model.php";
require_once "../usuarios/User.class.php";
header('Content-Type: application/json');
if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Erro na conexão com o banco de dados: " . $conn->connect_error]));
}
$user_id = $_SESSION['user_id'];
$user = Usuario::find($user_id);
/*************************************************/

/**************** RECEBE AS INFORMAÇÕES DO FRONT-END ************************/
$rawData = file_get_contents("php://input");

if (!$rawData) {
    echo json_encode(["success" => false, "message" => "Erro ao receber os dados."]);
    exit();
}

$data = json_decode($rawData, true);
/***************************************************************************/

/**************** VALIDAÇÃO DOS CAMPOS ************************/
if (!isset($data['produto_nome']) || !isset($data['etapas']) || !is_array($data['etapas'])) {
    echo json_encode(["success" => false, "message" => "Dados incompletos ou inválidos."]);
    exit();
}
/*************************************************************/

try {
    $conn->begin_transaction();

    /**************** INSERIR NOVO PRODUTO ************************/
    $stmtProducao = $conn->prepare("INSERT INTO etapas_producao (etapa_nome) VALUES (?)");
    $stmtProducao->bind_param("s", $data['produto_nome']);
    $stmtProducao->execute();
    $producaoId = $conn->insert_id;
    $stmtProducao->close();

    $primeiraEtapaId = null;
    /*************************************************************/

    /**************** INSERIR AS ETAPAS DO PRODUTO ************************/
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

        if ($etapa["ordem"] == 1) {
            $primeiraEtapaId = $etapaId;
        }
    }
    /*************************************************************/

    /**************** ATUALIZAR A PRIMEIRA ETAPA ************************/
    if ($primeiraEtapaId !== null) {
        $stmtUpdate = $conn->prepare("UPDATE etapas_producao SET etor_id = ? WHERE etapa_id = ?");
        $stmtUpdate->bind_param("ii", $primeiraEtapaId, $producaoId);
        $stmtUpdate->execute();
        $stmtUpdate->close();
    }
    /********************************************************************/

    $conn->commit();
    echo json_encode(["success" => true, "message" => "Produto e etapas cadastrados com sucesso!"]);

    /**************** FORMATANDO AS ETAPAS PARA SALVAR NO LOG ************************/
    $etapasStr = formatarEtapasLog($data['etapas']);
    SalvarLog(
        "O usuário ({$user->user_id} - {$user->user_nome}), cadastrou o produto: ({$data['produto_nome']}).\nCom as etapas:\n\n{$etapasStr}",
        Acoes::CADASTRAR_ETAPA,
        "sucesso"
    );

    /*********************************************************************************/


} catch (Exception $e) {
    /**************** FORMATANDO AS ETAPAS PARA SALVAR NO LOG ************************/
    $etapasStr = formatarEtapasLog($data['etapas']);
    $conn->rollback();
    echo json_encode(["success" => false, "message" => "Erro ao cadastrar etapas: " . $e->getMessage()]);
    SalvarLog("O usuário ({$user->user_id} - {$user->user_nome}), tentou cadastrar o produto: ({$data['produto_nome']}).\nCom as etapas:\n\n({$etapasStr}). \nMotivo do erro: ({$e->getMessage()})", Acoes::CADASTRAR_ETAPA, "erro");
    /********************************************************************************/
}

$conn->close();
?>