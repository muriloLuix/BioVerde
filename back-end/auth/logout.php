<?php
/**************** HEADERS ************************/
session_start();
include_once "../inc/funcoes.inc.php";
require_once "../MVC/Model.php";
require_once "../usuarios/User.class.php";
header('Content-Type: application/json');

verificarAutenticacao($conn, $_SESSION['user_id']);

/**************** LOG E LIMPEZA DE SESSÃO ************************/
$user_id = $_SESSION['user_id'];
$user    = Usuario::find($user_id);
salvarLog(
    "O usuário {$user->user_id} - {$user->user_nome} fez logout do sistema.",
    Acoes::LOGOUT,
    "sucesso"
);

/**************** LIMPA AS VARIÁVEIS NA SESSÃO ************************/
$_SESSION = [];

/**************** DESTROI A SESSÃO ************************/
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(), 
        '', 
        time() - 42000,
        $params["path"], 
        $params["domain"],
        $params["secure"], 
        $params["httponly"]
    );
}
session_destroy();

echo json_encode([
    "success" => true,
    "message" => "Logout realizado com sucesso."
]);
exit();
