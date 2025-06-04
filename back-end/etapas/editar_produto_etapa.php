<?php
/**************** HEADERS ************************/
session_start();
include_once "../inc/funcoes.inc.php";
include_once "../MVC/Model.php";
include_once "../usuarios/User.class.php";
include_once "../etapas/Etapa.class.php";
include_once "../etapas/EtapaProducao.class.php";
header_remove('X-Powered-By');
header('Content-Type: application/json');
$user_id = verificarAutenticacao($conn, $_SESSION['user_id']);
$user = Usuario::find($user_id);
/*************************************************/
try {

    /**************** RECEBE AS INFORMAÇÕES DO FRONT-END ************************/
    $rawData = file_get_contents("php://input");
    if (!$rawData) {
        throw new Exception("Erro ao receber os dados.");
    }

    $data = json_decode($rawData, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON inválido: " . json_last_error_msg());
    }

    /***************************************************************************/

    /**************** VERIFICA SE O PRODUTO EXISTE ************************/
    if (!verifyExist($conn, $data['produto_id'], 'etapa_id', 'etapas_producao')) {
        throw new Exception('Produto não encontrado');
    }
    /***********************************************************************/

    /**************** VERIFICA SE JÁ EXISTE UM PRODUTO COM O MESMO NOME (exceto o atual) ************************/
    $verificaNome = $conn->prepare("SELECT etapa_id FROM etapas_producao WHERE etapa_produtoNome = ? AND etapa_id != ?");
    $verificaNome->bind_param("si", $data['produto_nome'], $data['produto_id']);
    $verificaNome->execute();
    $resultadoNome = $verificaNome->get_result();

    if ($resultadoNome->num_rows > 0) {
        throw new Exception("Já existe um produto com o nome informado.");
    }
    /***********************************************************************************************************/

    /**************** ATUALIZA O PRODUTO ************************/
    $produtoAntigo = EtapaProducao::find($data["produto_id"]);
    $camposAtualizados = [
        'etapa_produtoNome' => $data['produto_nome'],
    ];
    /***********************************************************/
    $resultado = updateData($conn, "etapas_producao", $camposAtualizados, $data['produto_id'], "etapa_id");

    if (!$resultado['success']) {
        throw new Exception($resultado['message'] ?? "Erro ao atualizar produto");
    }

    $produto = EtapaProducao::find($data["produto_id"]);

    /**************** COMPARA OS CAMPOS ************************/
    $alteracoes = [];
    foreach ($camposAtualizados as $campo => $novoValor) {
        $campoAntigo = $produtoAntigo->$campo ?? null;
        // Normalizar valores para comparação
        if (is_null($campoAntigo))
            $campoAntigo = '';
        if (is_null($novoValor))
            $novoValor = '';

        if ($campoAntigo != $novoValor) {
            $alteracoes[] = "Campo: $campo | De: '$campoAntigo' Para: '$novoValor'";
        }
    }
    /***********************************************************/

    /**************** MONTA A MENSAGEM DE LOG ************************/
    $logMensagem = "Usuário ({$user->user_id} - {$user->user_nome}), editou o produto: \n\n Nome: {$produto->produto_nome}\n\n";
    if (!empty($alteracoes)) {
        $logMensagem .= "Alterações:\n\n" . implode("\n", $alteracoes);
    } else {
        $logMensagem .= "Nenhuma alteração detectada.";
    }
    /***********************************************************/
    // Retorna sucesso
    echo json_encode([
        'success' => true,
        'message' => 'Produto atualizado com sucesso'
    ]);
    salvarLog($logMensagem, Acoes::EDITAR_PRODUTO_ETAPA, "sucesso");

} catch (Exception $e) {
    error_log("Erro em editar_produto.php: " . $e->getMessage());
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
    SalvarLog(
        "Erro ao editar o produto da etapa:\n\n Erro: {$e->getMessage()}",
        Acoes::EDITAR_PRODUTO_ETAPA,
        "sucesso"
    );

}