<?php
/**************** HEADERS ************************/
include_once "../inc/funcoes.inc.php";
header_remove('X-Powered-By');
header('Content-Type: application/json; charset=UTF-8');
/*************************************************/

/**************** VERIFICA CONEXÃO COM O BANCO ************************/
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Erro na conexão com o banco de dados"]);
    exit;
}
/*********************************************************************/

/**************** RECEBE AS INFORMAÇÕES DO FRONT-END ************************/
$rawData = file_get_contents("php://input");
$data = json_decode($rawData, true);

if (empty($data) || !isset($data["codigo"])) {
    echo json_encode(["success" => false, "message" => "Código não fornecido"]);
    exit;
}
/***************************************************************************/

/**************** FORMATA O CÓDIGO ************************/
$codigo = $conn->real_escape_string($data["codigo"]);
/**********************************************************/

/**************** VERIFICAR A VALIDADE DO CÓDIGO ************************/
$codigoValido = verificarCodigoRecuperacao($conn, $codigo);

if ($codigoValido) {
    echo json_encode(["success" => true, "message" => "Código válido!"]);
    salvarLog("Código $codigo validado com sucesso", Acoes::VERIFICAR_CODIGO);
} else {
    echo json_encode(["success" => false, "message" => "Código inválido ou expirado"]);
    salvarLog("Código $codigo inválido ou expirado", Acoes::VERIFICAR_CODIGO, "erro");

}
/***********************************************************************/

$conn->close();
exit;