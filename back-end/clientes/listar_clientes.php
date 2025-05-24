<?php
/**************** HEADERS ************************/
session_start();
include_once "../inc/funcoes.inc.php";
header('Content-Type: application/json');
/************************************************/

try {
    /**************** VERIFICA A CONEXÃO COM O BANCO ************************/
    if ($conn->connect_error) {
        throw new Exception("Erro na conexão com o banco de dados");
    }
    /*********************************************************************/

    /**************** PREPARA A CONSULTA ************************/
    $cols = [
        "c.cliente_id",
        "c.cliente_nome_ou_empresa",
        "CASE WHEN c.cliente_tipo = 'juridica' THEN 'Pessoa Jurídica' ELSE 'Pessoa Física' END",
        "c.cliente_cpf_ou_cnpj",
        "c.cliente_email",
        "c.cliente_telefone",
        "c.cliente_cep",
        "c.cliente_endereco",
        "c.cliente_numendereco",
        "c.cliente_complemento",
        "c.cliente_estado",
        "c.cliente_cidade",
        "CASE WHEN c.estaAtivo = 1 THEN 'ATIVO' ELSE 'INATIVO' END",
        "c.cliente_observacoes",
        "c.cliente_data_cadastro",
        "c.cliente_razao_social",
        "c.cliente_tipo",
        "c.estaAtivo"
    ];

    $joins = [];

    $clientes = search($conn, "clientes c", implode(",", $cols), $joins);

    /**************************************************************/

    echo json_encode([
        "success" => true,
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
