<?php
/**************** HEADERS ************************/
session_start();
include_once "../inc/funcoes.inc.php";
require_once "../MVC/Model.php";
require_once "../usuarios/User.class.php";
header('Content-Type: application/json');
$user_id = verificarAutenticacao($conn);
/*************************************************/

/**************** RECEBE AS INFORMAÇÕES DO FRONT-END ************************/
$rawData = file_get_contents("php://input");
if (!$rawData) {
    echo json_encode(["success" => false, "message" => "Erro ao receber os dados."]);
    exit();
}

$data = json_decode($rawData, true);
/***************************************************************************/

/**************** VALIDACAO DOS CAMPOS ************************/
$camposObrigatorios = ['nomeEtapa'];
$validacaoDosCampos = validarCampos($data, $camposObrigatorios);
if ($validacaoDosCampos !== null) {
    echo json_encode($validacaoDosCampos);
    exit();
}
/**************************************************************/

/**************** VERIFICAR SE O NOME DO PRODUTO JA EXISTE ************************/
$verifyName = verifyCredentials(
    $conn,
    'etapa_nomes',
    $data['nomeEtapa'],
    'etapa_nome'
);
if ($verifyName !== null) {
    echo json_encode($verifyName);
    exit();
}
/*********************************************************************************/

/**************** CADASTRO DE PRODUTO ************************/
$sql = "INSERT INTO etapa_nomes (etapa_nome) VALUES (?)";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Erro ao preparar o cadastro: " . $conn->error]);
    exit();
}

$stmt->bind_param(
    "s",
    $data['nomeEtapa'],
);
/************************************************************/

$user = Usuario::find($user_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Nome da Etapa cadastrado com sucesso!"]);
    SalvarLog(
        "O usuário ({$user->user_id} - {$user->user_nome}) cadastrou a etapa \n\n Etapa: {$data['nomeEtapa']}",
        Acoes::CADASTRAR_ETAPA,
        "sucesso"
    );
} else {
    echo json_encode(["success" => false, "message" => "Erro ao cadastrar o Nome da Etapa: " . $stmt->error]);
    SalvarLog(
        "O usuário ({$user->user_id} - {$user->user_nome}) tentou cadastrar a etapa \n\n Etapa: {$data['nomeEtapa']}",
        Acoes::CADASTRAR_ETAPA,
        "erro"
    );
}
