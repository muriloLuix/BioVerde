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

    /**************** TABELAS DA ETAPA ************************/
    $cols_etapa = array(
        "a.etor_id",
        "a.etor_ordem",
        "a.etor_etapa_nome",
        "a.etor_responsavel",
        "a.etor_tempo",
        "a.etor_insumos",
        "a.etor_observacoes",
        "a.etor_dtCadastro",
        "b.etapa_nome as produto_nome",
        "b.etapa_id as producao_id"
    );

    $joins = [
        [
            'type' => 'INNER',
            'join_table' => 'etapas_producao b',
            'on' => 'a.producao_id = b.etapa_id'
        ]
    ];
    /*************************************************************/

    /**************** BUSCA OS DADOS ************************/
    $etapas = search($conn, "etapa_ordem a", implode(",", $cols_etapa), $joins);
    /*******************************************************/

    /**************** AGRUPA AS ETAPAS POR PRODUÇÃO ************************/
    $produtosComEtapas = [];
    foreach ($etapas as $etapa) {
        $producaoId = $etapa['producao_id'];
        $produtoNome = $etapa['produto_nome'];

        if (!isset($produtosComEtapas[$producaoId])) {
            $produtosComEtapas[$producaoId] = [
                'produto_nome' => $produtoNome,
                'produto_id' => $producaoId,
                'etapas' => []
            ];
        }

        $produtosComEtapas[$producaoId]['etapas'][] = [
            'etor_id' => $etapa['etor_id'],
            'ordem' => $etapa['etor_ordem'],
            'nome_etapa' => $etapa['etor_etapa_nome'],
            'tempo' => $etapa['etor_tempo'],
            'insumos' => $etapa['etor_insumos'],
            'responsavel' => $etapa['etor_responsavel'],
            'obs' => $etapa['etor_observacoes'],
            'dtCadastro' => $etapa['etor_dtCadastro']
        ];
    }
    /*************************************************************/

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
?>
