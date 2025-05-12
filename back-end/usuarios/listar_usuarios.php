<?php
session_start();

include_once "../inc/funcoes.inc.php";
authorize(3);


header('Content-Type: application/json');

try {
    if ($conn->connect_error) {
        throw new Exception("Erro na conexão com o banco de dados");
    }

    // Buscar usuários
    
    $cols = [
        "u.user_id", 
        "u.user_nome", 
        "u.user_email", 
        "u.user_telefone", 
        "u.user_CPF", 
        "c.car_nome", 
        "n.nivel_nome",
        "CASE WHEN u.estaAtivo = 1 THEN 'ATIVO' ELSE 'INATIVO' END",
        "u.user_dtcadastro", 
        "u.estaAtivo",       
        "u.car_id", 
        "u.nivel_id"
      ];
      

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
    ];

    $usuarios = search($conn, "usuarios u", implode(",", $cols), $joins);

    // Buscar cargos
    $cargos = buscarCargos($conn);

    // Buscar níveis de acesso
    $niveis = buscarNiveisAcesso($conn);

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