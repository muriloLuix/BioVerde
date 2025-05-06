<?php
session_start();
ini_set("display_errors", '1');

include_once "../inc/funcoes.inc.php";

header('Content-Type: application/json');

try {
    if ($conn->connect_error) {
        throw new Exception("Erro na conexão com o banco de dados");
    }

    // Colunas na ordem desejada:
    // 0 cliente_id
    // 1 cliente_nome
    // 2 cliente_email
    // 3 cliente_telefone
    // 4 cliente_cpf_cnpj
    // 5 cliente_cep
    // 6 cliente_endereco
    // 7 cliente_numendereco
    // 8 cliente_estado
    // 9 cliente_cidade
    // 10 status_ativo (texto “ATIVO”/“INATIVO”)
    // 11 cliente_observacoes
    // 12 cliente_data_cadastro
    $cols = [
        "a.cliente_id",
        "a.cliente_nome",
        "a.cliente_email",
        "a.cliente_telefone",
        "a.cliente_cpf_cnpj",
        "a.cliente_cep",
        "a.cliente_endereco",
        "a.cliente_numendereco",
        "a.cliente_estado",
        "a.cliente_cidade",
        "CASE WHEN a.estaAtivo = 1 THEN 'ATIVO' ELSE 'INATIVO' END AS status_ativo",
        "a.cliente_observacoes",
        "a.cliente_data_cadastro"
    ];

    // Sem joins adicionais, caso não precise:
    $joins = [];

    $clientes = search($conn, "clientes a", implode(",", $cols), $joins);

    echo json_encode([
        "success"  => true,
        "clientes" => $clientes
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}

$conn->close();
