<?php
session_start();
ini_set('display_errors', 1);
include_once "../inc/funcoes.inc.php";
header('Content-Type: application/json');

if ($conn->connect_error) {
    throw new Exception("Erro na conexão com o banco de dados");
}

$query = '
    SELECT 
        cp.classificacao_nome,
        COUNT(cp.classificacao_id) AS quantity 
    FROM classificacao_produto AS cp  
    LEFT JOIN lote AS lt  
        ON cp.classificacao_id = lt.classificacao_id
    GROUP BY cp.classificacao_nome 
    ORDER BY cp.classificacao_nome 
';

advancedSearch($conn, $query);

$conn->close();
?>