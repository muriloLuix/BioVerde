<?php
/**************** HEADERS ************************/
session_start();
include_once "../inc/funcoes.inc.php";
header('Content-Type: application/json');
/*************************************************/

/**************** VERIFICA CONEXÃO COM O BANCO ************************/
if ($conn->connect_error) {
    throw new Exception("Erro na conexão com o banco de dados");
}
/*********************************************************************/

/**************** QUERY PARA PESQUISA ************************/
$query = "SELECT cp.classificacao_nome, COUNT(cp.classificacao_id) AS quantity";
$query .= " FROM classificacao_produto AS cp";
$query .= " LEFT JOIN lote AS lt ON cp.classificacao_id = lt.classificacao_id";
$query .= " GROUP BY cp.classificacao_nome";
$query .= " ORDER BY cp.classificacao_nome";

advancedSearch($conn, $query);
/************************************************************/
$conn->close();
?>