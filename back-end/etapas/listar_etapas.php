<?php
session_start();

ini_set("display_errors", '1');

include_once "../inc/funcoes.inc.php";

header('Content-Type: application/json');

try {
    if ($conn->connect_error) {
        throw new Exception("Erro na conexão com o banco de dados");
    }

    $cols_etapa = array(
        "a.etor_id",
        "a.etor_etapa_nome",
        "a.etor_responsavel",
        "a.etor_tempo",
        "a.etor_insumos",
        "a.etor_observacoes",
        "a.etor_dtCadastro",
        "b.etapa_nome as produto_nome",
        "b.produto_id"
    );
    
    $joins = [
        [
            'type' => 'INNER',
            'join_table' => 'etapas_producao b',
            'on' => 'a.producao_id = b.etapa_id'
        ]
    ];

    // Busca os dados com JOIN
    $etapas = search($conn, "etapa_ordem a", implode(",", $cols_etapa), $joins);

    // Agrupa as etapas por produto
    $produtosComEtapas = [];
    foreach ($etapas as $etapa) {
        $produtoNome = $etapa['produto_nome'];
        $produtoId = $etapa['produto_id'];
        
        if (!isset($produtosComEtapas[$produtoId])) {
            $produtosComEtapas[$produtoId] = [
                'produto_nome' => $produtoNome,
                'produto_id' => $produtoId,
                'etapas' => []
            ];
        }
        
        $produtosComEtapas[$produtoId]['etapas'][] = [
            'etor_id' => $etapa['etor_id'],
            'ordem' => $etapa['etor_id'], 
            'nome_etapa' => $etapa['etor_etapa_nome'],
            'tempo' => $etapa['etor_tempo'],
            'insumos' => $etapa['etor_insumos'],
            'responsavel' => $etapa['etor_responsavel'],
            'obs' => $etapa['etor_observacoes'],
            'dtCadastro' => $etapa['etor_dtCadastro']
        ];
    }

    echo json_encode([
        "success" => true,
        "etapas" => array_values($produtosComEtapas)
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}

$conn->close();