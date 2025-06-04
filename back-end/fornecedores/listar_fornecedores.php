<?php
/**************** HEADERS ************************/
session_start();
include_once "../inc/funcoes.inc.php";
header('Content-Type: application/json');
/*************************************************/

try {
    /**************** VERIFICA CONEXÃO COM O BANCO ************************/
    if ($conn->connect_error) {
        throw new Exception("Erro na conexão com o banco de dados");
    }
    /*************************************************************/

    /**************** VERIFICA DOCUMENTOS ************************/
    $verifiedDocuments = verifyDocuments("121.551.469-73", "fisica");
    /*************************************************************/

    /**************** COLUNAS DA TABELA FORNECEDORES ************************/
    $cols = [

        "f.fornecedor_id",
        "f.fornecedor_nome",
        "f.fornecedor_documento",
        "f.fornecedor_email",
        "f.fornecedor_telefone",
        "f.fornecedor_cep",
        "f.fornecedor_endereco",
        "f.fornecedor_num_endereco",
        "f.fornecedor_complemento",
        "f.fornecedor_cidade",
        "f.fornecedor_estado",
        "f.fornecedor_dtcadastro",
        "f.fornecedor_razao_social",
        "f.fornecedor_tipo",
        "f.estaAtivo"

    ];
    /*****************************************************************/

    /**************** FAZ A BUSCA COM BASE NAS TEBELAS ************************/
    $fornecedores = search($conn, "fornecedores f", implode(",", $cols));
    /**************************************************************************/

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