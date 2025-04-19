<?php

session_start();
include_once "../inc/funcoes.inc.php";

session_unset();
session_destroy();

header('Content-Type: application/json');
echo json_encode([
    "success" => true,
    "message" => "Logout realizado com sucesso."
]);


?>