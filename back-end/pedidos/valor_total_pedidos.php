<?php
session_start();
ini_set('display_errors', 1);
include_once "../inc/funcoes.inc.php";
header('Content-Type: application/json');

// produto acabado mais pedido
// produto matéria-prima mais usado

if ($conn->connect_error) {
    throw new Exception("Erro na conexão com o banco de dados");
}

$rawData = file_get_contents("php://input");

if (!$rawData) {
    throw new Exception("Erro ao receber os dados.");
}

$data = json_decode($rawData, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    throw new Exception("JSON inválido: " . json_last_error_msg());
}

$query = '
    SELECT 
        YEAR(p.pedido_dtCadastro) AS year,
        MONTH(p.pedido_dtCadastro) AS month,
        MONTHNAME(p.pedido_dtCadastro) AS monthName,
        SUM(p.pedido_valor_total) as rawValue
    FROM pedidos p
    WHERE p.pedido_dtCadastro BETWEEN \'' . $data['start'] . '\' AND \'' . $data['end'] . '\'
    GROUP BY year, month
    ORDER BY year, month
';


advancedSearch($conn, $query);

$conn->close();
