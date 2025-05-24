<?php
ini_set("display_errors", 1);
session_start();
include_once "../inc/funcoes.inc.php";

header_remove('X-Powered-By');
header('Content-Type: application/json');

try {
    if (!isset($_SESSION["user_id"])) {
        throw new Exception("Usuário não autenticado!");
    }

    if (!isset($conn) || $conn->connect_error) {
        throw new Exception("Erro na conexão com o banco: " . $conn->connect_error);
    }

    $rawData = file_get_contents("php://input");
    $data = json_decode($rawData, true);

    if (!isset($data['lote_codigo'], $data['campo'], $data['valor'])) {
        throw new Exception("Dados incompletos enviados.");
    }

    $lote_codigo = $data['lote_codigo'];
    $campoRecebido = $data['campo'];
    $valor = $data['valor'];

    // 🔁 Mapeia o nome do campo recebido para o nome real no banco
    $aliasParaColuna = [
        "produto" => "produto_id",
        "fornecedor" => "fornecedor_id",
        "tipo" => "tipo_id",
        "classificacao" => "classificacao_id",
        "quantInicial" => "lote_quantInicial",
        "quantAtual" => "lote_quantAtual",
        "dtcolheita" => "lote_dtColheita",
        "dtvalidade" => "lote_dtValidade",
        "localArmazenado" => "localArmazenamento_id",
        "obs" => "lote_obs"
    ];

    $campo = $aliasParaColuna[$campoRecebido] ?? $campoRecebido;

    // Monta o array com campo dinâmico
    $camposAtualizados = [$campo => $valor];

    $resultado = updateData($conn, "lote", $camposAtualizados, $lote_codigo, "lote_codigo");

    if (!$resultado['success']) {
        throw new Exception($resultado['message'] ?? "Erro ao atualizar lote.");
    }

    echo json_encode(["success" => true, "message" => "Lote atualizado com sucesso!"]);

} catch (Exception $e) {
    error_log("Erro em editar_lote.php: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
