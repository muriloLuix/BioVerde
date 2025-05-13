<?php
header('Content-Type: application/json');
session_start();

// 1) conexão com o BD
include_once __DIR__ . "/../inc/ambiente.inc.php";

// 2) verifica sessão
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        "success" => false,
        "message" => "Sessão inválida"
    ]);
    exit;
}

// 3) busca nível mínimo
$sql  = "SELECT nivel_id FROM usuarios WHERE user_id = ?";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Erro na consulta: " . $conn->error
    ]);
    exit;
}
$stmt->bind_param('s', $_SESSION['user_id']);
$stmt->execute();
$stmt->bind_result($nivelMinimo);
$stmt->fetch();
$stmt->close();

// 4) compara níveis (casts para inteiro para evitar problema de tipo)
$nivelSessao = isset($_SESSION['nivel_acesso'])
    ? (int) $_SESSION['nivel_acesso']
    : null;

if ($nivelSessao === null || $nivelSessao < (int)$nivelMinimo) {
    echo json_encode([
        "success"      => false,
        "message"      => "Acesso negado: nível insuficiente",
        "nivel_acesso" => $nivelSessao,
        "nivel_minimo" => (int)$nivelMinimo
    ]);
    exit;
}

// 5) tudo ok
echo json_encode([
    "success"      => true,
    "message"      => "Acesso permitido",
    "nivel_acesso" => $nivelSessao,
    "nivel_minimo" => (int)$nivelMinimo
]);
exit;
