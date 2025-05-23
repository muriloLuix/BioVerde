<?php
session_start();
include_once "../inc/funcoes.inc.php";

header('Content-Type: application/json');

try {
    if ($conn->connect_error) {
        throw new Exception("Erro na conexão com o banco de dados");
    }

    // Buscar logs
    $cols = [
        "log_id",
        "log_user_id",
        "log_user_nome",
        "log_datahora",
        "log_pag_id",
        "log_url",
        "log_acao",
        "log_conteudo",
        "log_ip",
        "log_user_agent",
        "log_status",
        "log_referencia"
    ];

    $logs = search($conn, "log", implode(",", $cols));

    echo json_encode([
        "success" => true,
        "logs" => $logs
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}

$conn->close();
?>