<?php
/**************** HEADERS ************************/
session_start();
include_once "../inc/funcoes.inc.php";
require_once "../MVC/Model.php";
require_once "../usuarios/User.class.php";
require_once "../etapas/Etapa.class.php";
header_remove('X-Powered-By');
header('Content-Type: application/json');
/************************************************/

try {
    /**************** VERIFICA A AUTENTICAÇÃO ************************/
    if (!isset($_SESSION["user_id"])) {
        throw new Exception("Usuário não autenticado.");
    }
    /*****************************************************************/

    /**************** CONEXÃO COM O BANCO ************************/
    if ($conn->connect_error) {
        throw new Exception("Erro na conexão com o banco: " . $conn->connect_error);
    }
    /***************************************************************/

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

    /**************** VALIDAÇÃO DOS CAMPOS ************************/
    $camposObrigatorios = ['nome_etapa', 'responsavel', 'tempo', 'insumos', 'obs'];
    foreach ($camposObrigatorios as $campo) {
        if (!isset($data[$campo])) {
            throw new Exception("Campo obrigatório ausente: $campo");
        }
    }
    $validacaoDosCampos = validarCampos($data, $camposObrigatorios);
    if ($validacaoDosCampos !== null) {
        echo json_encode($validacaoDosCampos);
        exit();
    }

    /************************************************************/

    /**************** VERIFICA SE O ID DA ETAPA FOI ENVIADO ************************/
    if (empty($data['etor_id'])) {
        throw new Exception("ID da etapa não informado.");
    }
    /********************************************************************************/

    /**************** ATUALIZA A ETAPA ************************/

    $etapaAntiga = Etapa::find($data['etor_id']);
    $user = Usuario::find($_SESSION['user_id']);

    $camposAtualizados = [
        'etor_etapa_nome' => $data['nome_etapa'],
        'etor_tempo' => $data['tempo'],
        'etor_insumos' => $data['insumos'],
        'etor_responsavel' => $data['responsavel'],
        'etor_observacoes' => $data['obs']
    ];

    $resultado = updateData($conn, "etapa_ordem", $camposAtualizados, $data['etor_id'], "etor_id");
    if (!$resultado['success']) {
        throw new Exception($resultado['message'] ?? "Erro ao atualizar a etapa.");
    }

    /********************************************************/

    echo json_encode([
        "success" => true,
        "message" => "Etapa atualizada com sucesso!"
    ]);

    /**************** COMPARA OS CAMPOS ************************/
    $alteracoes = [];
    foreach ($camposAtualizados as $campo => $novoValor) {
        $campoAntigo = $etapaAntiga->$campo ?? null;
        // Normalizar valores para comparação
        if (is_null($campoAntigo)) $campoAntigo = '';
        if (is_null($novoValor)) $novoValor = '';

        if ($campoAntigo != $novoValor) {
            $alteracoes[] = "Campo: $campo | De: '$campoAntigo' Para: '$novoValor'";
        }
    }
    /***********************************************************/

    /**************** MONTA A MENSAGEM DE LOG ************************/
    $logMensagem = "O usuário ({$user->user_id} - {$user->user_nome}), editou a etapa: ({$data['etor_id']} - {$data['nome_etapa']}). Do produto: ({$data['produto_id']} - {$data['produto_nome']}).";
    if (!empty($alteracoes)) {
        $logMensagem .= "Alterações:\n" . implode("\n", $alteracoes);
    } else {
        $logMensagem .= "Nenhuma alteração detectada.";
    }
    /***********************************************************/

    salvarLog($logMensagem, Acoes::EDITAR_ETAPA, "sucesso");

} catch (Exception $e) {
    error_log("Erro em editar.etapa.php: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
    salvarLog("O usuário ({$user->user_id} - {$user->user_nome}), tentou editar a etapa: ({$data['etor_id']} - {$data['nome_etapa']}) do produto: ({$data['produto_id']} - {$data['produto_nome']}). Motivo do erro: {$e->getMessage()}", Acoes::EDITAR_ETAPA, "erro");
}

$conn->close();
?>