<?php
/**************** HEADERS ************************/
session_start();
include_once "../inc/funcoes.inc.php";
require_once "../MVC/Model.php";
require_once "../usuarios/User.class.php";
header('Content-Type: application/json');
/*************************************************/

/**************** MVC ************************/
$user_id = $_SESSION['user_id'];
$user = Usuario::find($user_id);
/*************************************************/

salvarLog("O usuário {$user->user_id} - {$user->user_nome} fez logout do sistema.", Acoes::LOGOUT, "sucesso");

session_unset();
session_destroy();

echo json_encode([
    "success" => true,
    "message" => "Logout realizado com sucesso."
]);

?>
