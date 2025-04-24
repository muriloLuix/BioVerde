<?php 
ini_set("display_errors",1);

session_start();

include_once "../inc/funcoes.inc.php";

// if(!isset($_SESSION["user_id"])) {
//     checkLoggedUSer($conn, $_SESSION['user_id']);
//     exit;
// }

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

foreach ($data["etapas"] as $etapa) {
    $etapaId = $etapa["id"];
    $etapaOrdem = $etapa["ordem"];
    $etapaNome = $etapa["nome_etapa"];
    $etapaTempo = $etapa["tempo"];
    $etapaInsumos = $etapa["insumos"];
    $etapaResponsavel = $etapa["responsavel"];
    $etapaObs = $etapa["obs"];
    $etapaCadastro = $etapa["dtCadastro"];
}

exit;

// Validação dos dados recebidos
$requiredFields = ['produto_nome', 'id', 'ordem', 'nome_etapa', 'tempo', 'insumos', 'responsavel', 'obs', 'dtCadastro'];
$validationError = validarCampos($data, $requiredFields);
if ($validationError) {
    echo json_encode($validationError);
    exit();
}