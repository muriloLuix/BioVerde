<?php
/**************** HEADERS ************************/
global $conn;
include_once '../inc/funcoes.inc.php';
include_once '../MVC/Model.php';
include_once '../usuarios/User.class.php';

header_remove('X-Powered-By');
header('Content-Type: application/json; charset=UTF-8');

/********************* Lê o payload antes de session_start *********************/
$rawData = file_get_contents("php://input");
$data = json_decode($rawData, true);

/********************* Define cookie de sessão longo (30 dias) ou padrão (sessão) *********************/
$remember = isset($data['remember']) && $data['remember'] === true;
$cookieParams = session_get_cookie_params();
$lifetime = $remember ? 60 * 60 * 24 * 30 : 0; // 0 = até fechar o browser
session_set_cookie_params([
    'lifetime' => $lifetime,
    'path' => $cookieParams['path'],
    'domain' => $cookieParams['domain'],
    'secure' => $cookieParams['secure'],
    'httponly' => $cookieParams['httponly'],
    'samesite' => 'Lax',
]);
session_start();
/************************************************/

/**************** VERIFICA A CONEXÃO COM O BANCO ************************/
if ($conn->connect_error) {
    salvarLog("Erro na conexão com o banco de dados", Acoes::LOGIN, "erro");
    die(json_encode([
        "success" => false,
        "message" => "Erro na conexão com o banco de dados"
    ]));
}
/*********************************************************************/

/**************** VALIDAÇÃO DOS DADOS ************************/
if (empty($data) || !isset($data["email"]) || !isset($data["password"])) {
    salvarLog("Tentativa de login sem email ou senha", Acoes::LOGIN, "erro");
    echo json_encode([
        "success" => false,
        "message" => "Campos obrigatórios não informados."
    ]);
    exit();
}

$email = $conn->real_escape_string($data["email"]);
$password = $data["password"];
/************************************************************/

/**************** VERIFICA CREDENCIAIS ************************/
$resultado = verificarCredenciais($conn, $email, $password);
/**************************************************************************/

/**************** TRATA SUCESSO/ERRO ************************/
if ($resultado["success"]) {
    $sql = "SELECT user_id, nivel_id FROM usuarios WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $resultado["user"]["id"]);
    $stmt->execute();
    $stmt->bind_result($user_id, $nivel_id);
    $stmt->fetch();
    $stmt->close();

    $_SESSION['user_id'] = $user_id;
    $_SESSION['nivel_acesso'] = $nivel_id;
    $_SESSION['last_activity'] = time();

    echo json_encode([
        "success" => true,
        "message" => "Login realizado com sucesso!",
        "user" => $resultado["user"]
    ]);

    $user = Usuario::find($user_id);
    salvarLog(
        "Login bem-sucedido para o usuário: {$user->user_id} - {$user->user_nome}",
        Acoes::LOGIN,
        "sucesso"
    );
} else {
    echo json_encode([
        "success" => false,
        "message" => $resultado["message"]
    ]);
    salvarLog(
        "Falha no login para o email: {$email} - Motivo: {$resultado['message']}",
        Acoes::LOGIN,
        "erro"
    );
}

$conn->close();
exit();
