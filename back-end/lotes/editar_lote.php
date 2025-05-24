<?php
ini_set("display_errors", 1);
session_start();

include_once "../inc/funcoes.inc.php";

header_remove('X-Powered-By');
header('Content-Type: application/json');

try {
    // Verifica autenticação
    if (!isset($_SESSION["user_id"])) {
        checkLoggedUSer($conn, $_SESSION['user_id']);
        exit;
    }

    // Verifica conexão com o banco
    if ($conn->connect_error) {
        throw new Exception("Erro na conexão com o banco: " . $conn->connect_error);
    }

    // Processa os dados de entrada
    $rawData = file_get_contents("php://input");
    if (!$rawData) {
        throw new Exception("Erro ao receber os dados.");
    }

    $data = json_decode($rawData, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON inválido: " . json_last_error_msg());
    }

    // Verifica se o lote existe
    if (!verifyExist($conn, $data['lote_id'], 'lote_id', 'lote')) {
        throw new Exception('Lote não encontrado');
    }

    // Validação dos campos obrigatórios
    $camposObrigatorios = ['produto', 'fornecedor', 'dt_colheita', 'quant_inicial', 'quant_atual', 'unidade', 'tipo', 'dt_validade', 'classificacao', 'localArmazenado'];
    $validacaoDosCampos = validarCampos($data, $camposObrigatorios);
    if ($validacaoDosCampos !== null) {
        echo json_encode($validacaoDosCampos);
        exit();
    }

    $lote_dtColheita = $data['dt_colheita'] . ' 00:00:00';
    $lote_dtValidade = $data['dt_validade'] . ' 00:00:00';

    // Atualiza lote
    $camposAtualizados = [
        'produto_id' => (int)$data['produto'],
        'fornecedor_id' => (int)$data['fornecedor'],
        'lote_quantInicial' => $data['quant_inicial'],
        'lote_quantAtual' => $data['quant_atual'],
        'uni_id' => (int)$data['unidade'],
        'lote_dtColheita' => $lote_dtColheita,
        'tproduto_id' => (int)$data['tipo'],
        'lote_dtValidade' => $lote_dtValidade,
        'classificacao_id' => (int)$data['classificacao'],
        'localArmazenamento_id' => (int)$data['localArmazenado'],
        'lote_obs' => $data['obs']
    ];

    $resultado = updateData($conn, "lote", $camposAtualizados, $data['lote_id'], "lote_id");
    
    if (!$resultado['success']) {
        throw new Exception($resultado['message'] ?? "Erro ao atualizar lote");
    }

    // Retorna sucesso
    echo json_encode([
        'success' => true,
        'message' => 'Lote atualizado com sucesso',
        'lote_codigo' => $data['lote_codigo']
    ]);

} catch (Exception $e) {
    error_log("Erro em editar_lote.php: " . $e->getMessage());
    echo json_encode([
        "success" => false, 
        "message" => $e->getMessage()
    ]);
}