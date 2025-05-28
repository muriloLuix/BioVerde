<?php
session_start();
ini_set('display_errors', 1);
include_once "../inc/funcoes.inc.php";
header('Content-Type: application/json');

if ($conn->connect_error) {
    throw new Exception("Erro na conexão com o banco de dados");
}

$query = 'SELECT * FROM estoque';

advancedSearch($conn, $query);

$conn->close();
?>