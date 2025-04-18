<?php
session_start();

include_once "../inc/funcoes.inc.php";

header('Content-Type: application/json');

try {
    if ($conn->connect_error) {
        throw new Exception("Erro na conexão com o banco de dados");
    }

    // Buscar usuários
    
    $cols = array("u.user_id", "u.user_nome", "u.user_email", "u.user_telefone", "u.user_CPF", "c.car_nome", "n.nivel_nome", "s.sta_nome", "u.user_dtcadastro", "u.car_id", "u.nivel_id", "u.sta_id");

    $joins = [
        [
            "type" => "INNER",
            "join_table" => "cargo c",
            "on" => "u.car_id = c.car_id"
        ],
        [
            "type" => "INNER",
            "join_table" => "niveis_acesso n",
            "on" => "u.nivel_id = n.nivel_id"
        ],
        [
            "type" => "LEFT",
            "join_table" => "status s",
            "on" => "u.sta_id = s.sta_id"
        ]
    ];

    $usuarios = search($conn, "usuarios u", implode(",", $cols), $joins);

    // Buscar cargos
    $cargos = buscarCargos($conn);

    // Buscar níveis de acesso
    $niveis = buscarNiveisAcesso($conn);

    // Buscar status
    $status = buscarStatus($conn);

    echo json_encode([
        "success" => true,
        "usuarios" => $usuarios,
        "cargos" => $cargos,
        "niveis" => $niveis
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