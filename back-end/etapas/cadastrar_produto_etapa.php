<?php
/**************** HEADERS ************************/
session_start();
include_once "../inc/funcoes.inc.php";
require_once "../MVC/Model.php";
require_once "../usuarios/User.class.php";
require_once "../etapas/Etapa.class.php";
header('Content-Type: application/json');
$user_id = verificarAutenticacao($conn, $_SESSION['user_id']);
/*************************************************/

/**************** RECEBE AS INFORMAÇÕES DO FRONT-END ************************/
$rawData = file_get_contents("php://input");
if (!$rawData) {
    echo json_encode(["success" => false, "message" => "Erro ao receber os dados."]);
    exit();
}

$data = json_decode($rawData, true);
/***************************************************************************/

/**************** Validação do campo produto_id ************************/
if (!isset($data['produto_id'])) {
    echo json_encode(["success" => false, "message" => "ID do produto não informado."]);
    exit();
}
/************************************************************************/

/********************** Busca o nome do produto *************************/
$produto_id = $data["produto_id"];

$stmt = $conn->prepare("SELECT produto_nome FROM produtos WHERE produto_id = ?");
$stmt->bind_param("i", $produto_id);
$stmt->execute();
$result = $stmt->get_result();

if (!$row = $result->fetch_assoc()) {
    echo json_encode(["success" => false, "message" => "Produto não encontrado."]);
    exit();
}
$produtoNome = $row['produto_nome'];

/************************************************************************/

/******** Verifica se já existe na etapas_producao **********************/
$verify = $conn->prepare("SELECT etapa_id FROM etapas_producao WHERE etapa_produtoNome = ?");
$verify->bind_param("s", $produtoNome);
$verify->execute();
$result = $verify->get_result();
if ($row = $result->fetch_assoc()) {
    $etapa_id = $row['etapa_id'];
    echo json_encode(["success" => false, "message" => "Este produto já está cadastrado nas etapas de produção."]);
    exit();
}
$verify->close();
/************************************************************************/

/******** Insere na etapas_producao **********************/
$stmtInsert = $conn->prepare("INSERT INTO etapas_producao (etapa_produtoNome) VALUES (?)");
$stmtInsert->bind_param("s", $produtoNome);
/*********************************************************/

$user = Usuario::find($user_id);
$etapa = Etapa::find($etapa_id);

if ($stmtInsert->execute()) {
    echo json_encode(["success" => true, "message" => "Produto cadastrado com sucesso!", "etapa_id" => $conn->insert_id]);
    SalvarLog(
        "O usuário ({$user->user_id} - {$user->user_nome}) cadastrou a etapa: \n\n Etapa: {$etapa->etapa_nome}\n\n No produto: {$produtoNome}",
        Acoes::CADASTRAR_PRODUTO_ETAPA,
        "sucesso"
    );
} else {
    echo json_encode(["success" => false, "message" => "Erro ao cadastrar o Produto: " . $stmtInsert->error]);
    SalvarLog(
        "O usuário ({$user->user_id} - {$user->user_nome}) tentou cadastrar a etapa: \n\n Etapa: {$etapa->etapa_nome}\n\n No produto: {$produtoNome}. \n\n Erro: {$stmtInsert->error}",
        Acoes::CADASTRAR_PRODUTO_ETAPA,
        "erro"
    );
}

$conn->close();
