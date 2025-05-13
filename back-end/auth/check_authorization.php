<?php
session_start();

include_once "../inc/funcoes.inc.php";

$nivelMinimo = 2;

authorize($nivelMinimo);

header('Content-Type: application/json');

echo json_encode([
    "success" => true,
    "nivel_acesso" => $_SESSION['nivel_acesso']
]);
