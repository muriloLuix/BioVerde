<?php
/**************** HEADERS ************************/
session_start();
include_once "../inc/funcoes.inc.php";
header('Content-Type: application/json');
/************************************************/

try {
    if ($conn->connect_error) {
        throw new Exception("Erro na conexão com o banco de dados");
    }

    /**************** COLUNAS E JOINS ************************/
    $cols_etapa = array(
        "a.etor_id",
        "a.etor_ordem",
        "a.etor_tempo",
        "a.etor_insumos",
        "a.etor_observacoes",
        "a.etor_unidade",
        "a.etor_dtCadastro",
        "b.etapa_produtoNome as produto_nome",
        "b.etapa_id as producao_id",
        "e.etapa_nome_id",
        "e.etapa_nome"
    );

    $joins = [
        [
            'type' => 'LEFT',
            'join_table' => 'etapa_ordem a',
            'on' => 'b.etapa_id = a.producao_id'
        ],
        [
            'type' => 'LEFT',
            'join_table' => 'etapa_nomes e',
            'on' => 'e.etapa_nome_id = a.etor_nome_id'
        ],
    ];

    $etapas = search($conn, "etapas_producao b", implode(",", $cols_etapa), $joins);

    /**************** AGRUPAMENTO POR PRODUTO ************************/
    $produtosMap = [];

    foreach ($etapas as $etapa) {
        $produtoId = $etapa['producao_id'];

        // Inicializa o produto se ainda não existir
        if (!isset($produtosMap[$produtoId])) {
            $produtosMap[$produtoId] = [
                'produto_id' => (int)$produtoId,
                'produto_nome' => $etapa['produto_nome'],
                'etapas' => []
            ];
        }

        if (!empty($etapa['etor_id'])) {
            $insumosArray = array_map('trim', explode(',  ', $etapa['etor_insumos'] ?? ''));

            $produtosMap[$produtoId]['etapas'][] = [
                'etor_id' => (int)$etapa['etor_id'],
                'etor_ordem' => (int)$etapa['etor_ordem'],
                'etapa_nome' => $etapa['etapa_nome'],
                'etor_tempo' => $etapa['etor_tempo'],
                'etor_insumos' => $insumosArray,
                'etor_observacoes' => $etapa['etor_observacoes'],
                'etor_unidade' => $etapa['etor_unidade'],
                'etor_dtCadastro' => $etapa['etor_dtCadastro'],
                'producao_id' => (int)$etapa['producao_id']
            ];
        }
    }

    echo json_encode([
        "success" => true,
        "etapas" => array_values($produtosMap)
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
