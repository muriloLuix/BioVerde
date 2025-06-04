<?php
/**************** HEADERS ************************/
session_start();
include_once "../inc/funcoes.inc.php";
header('Content-Type: application/json');
verificarAutenticacao($conn);
/*************************************************/

$query = "SELECT * FROM estoque";

advancedSearch($conn, $query);

$conn->close();
?>