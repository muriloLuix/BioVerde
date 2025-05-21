<?php
session_start();
include_once "../inc/funcoes.inc.php";
header('Content-Type: application/json');

try {
    if ($conn->connect_error) {
        throw new Exception("Erro na conexão com o banco de dados");
    }

    $cols = [

        "f.fornecedor_id", 
        "f.fornecedor_nome_ou_empresa", 
        "CASE WHEN f.fornecedor_tipo = 'juridica' THEN 'Pessoa Jurídica' ELSE 'Pessoa Física' END",
        "f.fornecedor_cpf_ou_cnpj", 
        "f.fornecedor_email", 
        "f.fornecedor_telefone", 
        "f.fornecedor_responsavel", 
        "f.fornecedor_cep", 
        "f.fornecedor_endereco", 
        "f.fornecedor_num_endereco", 
        "f.fornecedor_complemento", 
        "f.fornecedor_cidade", 
        "f.fornecedor_estado", 
        "CASE WHEN f.estaAtivo = 1 THEN 'ATIVO' ELSE 'INATIVO' END", 
        "f.fornecedor_dtcadastro",
        "f.fornecedor_razao_social",
        "f.fornecedor_tipo",
        "f.estaAtivo"

    ];

    $fornecedores = search($conn, "fornecedores f", implode(",", $cols));

    echo json_encode([
        "success" => true,
        "fornecedores" => $fornecedores
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