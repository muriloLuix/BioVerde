<?php
session_start();

include_once "../inc/funcoes.inc.php";

header('Content-Type: application/json');

try {
    if ($conn->connect_error) {
        throw new Exception("Erro na conexão com o banco de dados");
    }

    $cols = array("fornecedor_id", "fornecedor_nome", "fornecedor_razao_social", "fornecedor_email", "fornecedor_telefone", "fornecedor_CNPJ", "fornecedor_responsavel", "fornecedor_cep", "fornecedor_endereco", "fornecedor_num_endereco", "fornecedor_estado", "fornecedor_cidade", "b.sta_nome", "b.sta_id", "fornecedor_dtcadastro");

    $joins = [
        [
            "type" => "INNER",
            "join_table" => "status b",
            "on" => "a.fornecedor_status = b.sta_id"
        ]
    ];

    $fornecedores = search($conn, "fornecedores a", implode(",", $cols), $joins);

    $status = buscarStatus($conn);

    echo json_encode([
        "success" => true,
        "fornecedores" => $fornecedores,
        "status" => $status
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