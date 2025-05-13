<?php
header('Content-Type: application/json');
session_start();
include_once "../inc/funcoes.inc.php";

// Pesquisando o nivel do usuário que está na sessão e comparando com o nivel que está no banco de dados
$sql = "SELECT nivel_id FROM usuarios WHERE user_id = ?";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    return ["success" => false, "message" => "Erro ao preparar a query: " . $conn->error];
}
$stmt->bind_param('s', $_SESSION['user_id']);
$stmt->execute();
$stmt->bind_result($nivelMinimo);
$stmt->fetch();
$stmt->close();

authorize($nivelMinimo);

echo json_encode([
    "success" => true,
    "nivel_acesso" => $_SESSION['nivel_acesso'],
    "nivel_minimo" => $nivelMinimo
]);
