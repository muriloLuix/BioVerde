<?php
/**************** HEADERS ************************/
session_start();
include_once "../inc/funcoes.inc.php";
require_once "../MVC/Model.php";
require_once "../usuarios/User.class.php";
require_once "../lotes/Lote.class.php";
header_remove('X-Powered-By');
header('Content-Type: application/json');
$user_id = $_SESSION['user_id'];
$user = Usuario::find($user_id);
/*************************************************/

try {
    /**************** VERIFICA AUTENTICAÇÃO ************************/
    if (!isset($_SESSION["user_id"])) {
        checkLoggedUSer($conn, $_SESSION['user_id']);
        exit;
    }
    /***************************************************************/

    /**************** VERIFICA CONEXÃO COM O BANCO ************************/
    if ($conn->connect_error) {
        throw new Exception("Erro na conexão com o banco: " . $conn->connect_error);
    }
    /*********************************************************************/

    /**************** RECEBE AS INFORMAÇÕES DO FRONT-END ************************/
    $rawData = file_get_contents("php://input");

    if (!$rawData) {
        throw new Exception("Erro ao receber os dados.");
    }

    $data = json_decode($rawData, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON inválido: " . json_last_error_msg());
    }
    /****************************************************************************/

    /**************** VERIFICA SE O LOTE EXISTE ************************/
    if (!verifyExist($conn, $data['lote_id'], 'lote_id', 'lote')) {
        throw new Exception('Lote não encontrado');
    }
    /******************************************************************/

    /**************** VALIDAÇÕES ************************/
    $camposObrigatorios = ['produto', 'fornecedor', 'dt_colheita', 'quant_max', 'preco', 'unidade', 'tipo', 'dt_validade', 'classificacao', 'localArmazenado'];
    $validacaoDosCampos = validarCampos($data, $camposObrigatorios);
    if ($validacaoDosCampos !== null) {
        echo json_encode($validacaoDosCampos);
        exit();
    }

    $lote_dtColheita = $data['dt_colheita'] . ' 00:00:00';
    $lote_dtValidade = $data['dt_validade'] . ' 00:00:00';
    /**************************************************/

    /**************** ATUALIZAR O LOTE ************************/

    $loteAntigo = Lote::find($data['lote_id']);

    $camposAtualizados = [
        'produto_id' => (int) $data['produto'],
        'fornecedor_id' => (int) $data['fornecedor'],
        'lote_quantMax' => $data['quant_max'],
        'produto_preco' => $data['preco'],
        'uni_id' => (int) $data['unidade'],
        'lote_dtColheita' => $lote_dtColheita,
        'tproduto_id' => (int) $data['tipo'],
        'lote_dtValidade' => $lote_dtValidade,
        'classificacao_id' => (int) $data['classificacao'],
        'localArmazenamento_id' => (int) $data['localArmazenado'],
        'lote_obs' => $data['obs']
    ];

    $resultado = updateData($conn, "lote", $camposAtualizados, $data['lote_id'], "lote_id");

    if (!$resultado['success']) {
        throw new Exception($resultado['message'] ?? "Erro ao atualizar lote");
    }
    /**********************************************************/

    echo json_encode([
        'success' => true,
        'message' => 'Lote atualizado com sucesso',
        'lote_codigo' => $data['lote_codigo']
    ]);

    /**************** COMPARA OS CAMPOS ************************/
    $alteracoes = [];
    foreach ($camposAtualizados as $campo => $novoValor) {
        $campoAntigo = $loteAntigo->$campo ?? null;
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

    $loteClass = Lote::find($data['lote_id']);

    /**************** MONTA A MENSAGEM DE LOG ************************/
    $logMensagem = "O usuário ({$user->user_id} - {$user->user_nome}), editou o lote: ({$loteClass->lote_codigo}).\n\n";
    if (!empty($alteracoes)) {
        $logMensagem .= "Alterações:\n\n" . implode("\n", $alteracoes);
    } else {
        $logMensagem .= "Nenhuma alteração detectada.";
    }
    /***********************************************************/

    salvarLog($logMensagem, Acoes::EDITAR_LOTE, "sucesso");


} catch (Exception $e) {
    error_log("Erro em editar_lote.php: " . $e->getMessage());
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
    salvarLog("O usuário ({$user->user_id} - {$user->user_nome}), tentou editar o lote: ({$data['lote_codigo']}). \n\nMotivo do erro: {$e->getMessage()}", Acoes::EDITAR_LOTE, "erro");

}