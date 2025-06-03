<?php
/**************** HEADERS ************************/
session_start();
include_once "../inc/funcoes.inc.php";
require_once "../MVC/Model.php";
require_once "../usuarios/User.class.php";
require_once "../etapas/Etapa.class.php";
header_remove('X-Powered-By');
header('Content-Type: application/json');
verificarAutenticacao($conn);
/************************************************/

try {

    $user_id = $_SESSION['user_id'];
    $user = Usuario::find($user_id);

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
    $camposObrigatorios = ['etapa_nome_id', 'etor_tempo', 'etor_unidade'];
    $validacaoDosCampos = validarCampos($data, $camposObrigatorios);
    if ($validacaoDosCampos !== null) {
        echo json_encode($validacaoDosCampos);
        exit();
    }
    /************************************************************/

    /**************** CONVERTE OS INSUMOS EM STRING ************************/
    $etor_insumos = isset($data['etor_insumos']) && is_array($data['etor_insumos']) 
        ? implode(', ', array_map('trim', $data['etor_insumos'])) 
        : '';
    /************************************************************************/

    /**************** PREPARA OS DADOS PARA ATUALIZAÇÃO ************************/
    $etor_tempo = $data['etor_tempo'];
    $etor_unidade = $data['etor_unidade'];
    $etor_observacoes = $data['etor_observacoes'] ?? '';
    $etor_ordem = $data['etor_ordem'];
    $etor_nome_id = $data['etapa_nome_id'];
    $etor_id = (int)$data['etor_id'];
    /**************************************************************************/

    /**************** PREPARA E EXECUTA A ATUALIZAÇÃO **************************/
    $sql = "UPDATE etapa_ordem 
            SET etor_tempo = ?, 
                etor_unidade = ?, 
                etor_observacoes = ?, 
                etor_insumos = ?, 
                etor_nome_id = ?
            WHERE etor_id = ?";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Erro ao preparar a query: " . $conn->error);
    }

    $stmt->bind_param(
        "sssssi",
        $etor_tempo,
        $etor_unidade,
        $etor_observacoes,
        $etor_insumos,
        $etor_nome_id,
        $etor_id
    );

    if (!$stmt->execute()) {
        throw new Exception("Erro ao atualizar a etapa: " . $stmt->error);
    }
    /***************************************************************************/

    /**************** MONTA A MENSAGEM DE LOG ************************/
    $etapaAntiga = Etapa::find($etor_id);

    $camposAtualizados = [
        'etor_tempo' => $data['etor_tempo'],
        'etor_unidade' => $data['etor_unidade'],
        'etor_observacoes' => $data['etor_observacoes'],
        'etor_insumos' => is_array($data['etor_insumos']) 
            ? implode(',', $data['etor_insumos']) 
            : $data['etor_insumos'],
        'etor_nome_id' => $data['etapa_nome_id']
    ];

    $alteracoes = [];
    foreach ($camposAtualizados as $campo => $novoValor) {
        $campoAntigo = $etapaAntiga->$campo ?? '';
        $novoValor = $novoValor ?? '';

        if ($campoAntigo != $novoValor) {
            $alteracoes[] = "Campo: $campo | De: '$campoAntigo' Para: '$novoValor'";
        }
    }

    $logMensagem = "O usuário ({$user->user_id} - {$user->user_nome}), editou a etapa (etor_id: {$etor_id})";
    if (isset($data['produto_id']) && isset($data['produto_nome'])) {
        $logMensagem .= ", do produto ({$data['produto_id']} - {$data['produto_nome']})";
    }
    $logMensagem .= ".\n\n";

    $logMensagem .= !empty($alteracoes) ? "Alterações:\n" . implode("\n", $alteracoes) : "Nenhuma alteração detectada.";

    salvarLog($logMensagem, Acoes::EDITAR_ETAPA, "sucesso");
    /***********************************************************************/

    echo json_encode([
        "success" => true,
        "message" => "Etapa atualizada com sucesso!"
    ]);
} catch (Exception $e) {
    error_log("Erro em editar_etapas.php: " . $e->getMessage());

    // Monta log de erro
    $etor_id = isset($data['etor_id']) ? $data['etor_id'] : 'Desconhecido';
    $produto_id = isset($data['produto_id']) ? $data['produto_id'] : 'Desconhecido';
    $produto_nome = isset($data['produto_nome']) ? $data['produto_nome'] : 'Desconhecido';

    $logMensagem = "O usuário ({$user->user_id} - {$user->user_nome}) tentou editar a etapa (etor_id: {$etor_id})";
    if ($produto_id !== 'Desconhecido' && $produto_nome !== 'Desconhecido') {
        $logMensagem .= ", do produto ({$produto_id} - {$produto_nome})";
    }
    $logMensagem .= ".\n\nMotivo do erro: " . $e->getMessage();

    salvarLog($logMensagem, Acoes::EDITAR_ETAPA, "erro");

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}

$conn->close();
?>