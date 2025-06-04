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
        p.stapedido_id AS id,
        sp.stapedido_nome AS status, 
        COUNT(p.pedido_id) AS totalOrders
    FROM status_pedido sp
    LEFT JOIN pedidos p 
        ON p.stapedido_id = sp.stapedido_id
        AND p.pedido_dtCadastro BETWEEN \'' . $data['start'] . '\' AND \'' . $data['end'] . '\'
    GROUP BY sp.stapedido_nome
    ORDER BY sp.stapedido_id
';

advancedSearch($conn, $query);

$conn->close();

?>