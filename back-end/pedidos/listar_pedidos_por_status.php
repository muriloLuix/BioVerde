<?php
session_start();
ini_set('display_errors', 1);
include_once "../inc/funcoes.inc.php";
header('Content-Type: application/json');

// quantidade de pedidos separados por status no mês
// valor total arrecadado de pedidos no mês

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
    SELECT sp.stapedido_nome AS status, COUNT(*) AS total_pedidos
    FROM pedidos AS p
    LEFT JOIN status_pedido sp ON p.stapedido_id = sp.stapedido_id
    WHERE p.pedido_dtCadastro BETWEEN \'' . $data['start'] . '\' AND \'' . $data['end'] . '\'
    GROUP BY status
    ORDER BY status
';

advancedSearch($conn, $query);

$conn->close();
