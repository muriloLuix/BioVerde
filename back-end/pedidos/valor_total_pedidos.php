<?php
session_start();
ini_set('display_errors', 1);
include_once "../inc/funcoes.inc.php";
header('Content-Type: application/json');

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
        YEAR(p.pedido_prevEntrega) AS year,
        MONTH(p.pedido_prevEntrega) AS month,
        MONTHNAME(p.pedido_prevEntrega) AS monthName,
        SUM(p.pedido_valor_total) AS rawValue,
        COUNT(p.pedido_id) AS quantity
    FROM pedidos p
    WHERE 
        p.pedido_dtCadastro BETWEEN \'' . $data['start'] . '\' AND \'' . $data['end'] . '\'
        AND p.stapedido_id = 4
    GROUP BY year, month
    ORDER BY year, month
';


advancedSearch($conn, $query);

$conn->close();
?>