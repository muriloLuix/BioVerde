
<?php
session_start();

ini_set("display_errors",'1');

include_once "../inc/funcoes.inc.php";

header('Content-Type: application/json');

try {
    if ($conn->connect_error) {
        throw new Exception("Erro na conexão com o banco de dados");
    }

    $cols = array(
        "cliente_id",
        "cliente_nome",
        "cliente_email",
        "cliente_telefone",
        "cliente_cpf_cnpj",
        "cliente_cep",
        "cliente_endereco",
        "cliente_numendereco",
        "cliente_estado",
        "cliente_cidade",
        "status",
        "cliente_observacoes",
        "cliente_data_cadastro",
        "b.sta_id",
        "b.sta_nome"
    );
    
    $joins = [
        [
            'type' => 'INNER',
            'join_table' => 'status b',
            'on' => 'a.status = b.sta_id',
        ]
    ];
    
    $clientes = search($conn, "clientes a", implode(",", $cols), $joins);
    

    $status = buscarStatus($conn);

    echo json_encode([
        "success" => true,
        "clientes" => $clientes,
        "status"=> $status
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
