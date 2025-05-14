<?php
header('Content-Type: application/json');
session_start();
include_once "../inc/funcoes.inc.php";

// Verifique se a sessão está iniciada corretamente
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Sessão inválida"]);
    exit;
}

$sql = "SELECT nivel_id FROM usuarios WHERE user_id = ?";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Erro na consulta: " . $conn->error]);
    exit;
}
$stmt->bind_param('s', $_SESSION['user_id']);
$stmt->execute();
$stmt->bind_result($nivelMinimo);
$stmt->fetch();
$stmt->close();

if (!isset($_SESSION['nivel_acesso']) || $_SESSION['nivel_acesso'] !== $nivelMinimo) {
    echo json_encode([
        "success" => false,
        "nivel_acesso" => $_SESSION['nivel_acesso'],
        "nivel_minimo" => $nivelMinimo
    ]);
    exit;
} else {
    echo json_encode([
        "success" => true,
        "nivel_acesso" => $_SESSION['nivel_acesso'],
        "nivel_minimo" => $nivelMinimo
    ]);
    exit;
}

