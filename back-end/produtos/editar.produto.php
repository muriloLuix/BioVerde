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

    // Verifica se o produto existe
    if (!verifyExist($conn, $data['produto_id'], 'produto_id', 'produtos')) {
        throw new Exception('Produto não encontrado');
    }

    // Validação dos campos obrigatórios
    $camposObrigatorios = ['nome_produto', 'tipo', 'preco', 'status', 'fornecedor', 'obs'];
    $validacaoDosCampos = validarCampos($data, $camposObrigatorios);
    if ($validacaoDosCampos !== null) {
        echo json_encode($validacaoDosCampos);
        exit();
    }

    // Busca o ID do fornecedor pelo nome
    $fornecedorNome = $data['fornecedor'];
    $stmt = $conn->prepare("SELECT fornecedor_id FROM fornecedores WHERE fornecedor_nome_ou_empresa = ?");
    $stmt->bind_param("s", $fornecedorNome);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception("Fornecedor não encontrado: " . $fornecedorNome);
    }
    
    $fornecedor = $result->fetch_assoc();
    $id_fornecedor = $fornecedor['fornecedor_id'];

    // Validação do status
    if (empty($data['status'])) {
        throw new Exception("O campo status é obrigatório");
    }

    $sta_id = (int)$data['status'];
    if ($sta_id <= 0) {
        throw new Exception("Status inválido");
    }

    // Atualiza produto
    $camposAtualizados = [
        'produto_nome' => $data['nome_produto'],
        'tproduto_id' => (int)$data['tipo'],
        'produto_preco' => (float)$data['preco'],
        'status_id' => $sta_id,
        'id_fornecedor' => $id_fornecedor,
        'produto_observacoes' => $data['obs']
    ];

    $resultado = updateData($conn, "produtos", $camposAtualizados, $data['produto_id'], "produto_id");
    
    if (!$resultado['success']) {
        throw new Exception($resultado['message'] ?? "Erro ao atualizar produto");
    }

    // Retorna sucesso
    echo json_encode([
        'success' => true,
        'message' => 'Produto atualizado com sucesso'
    ]);

} catch (Exception $e) {
    error_log("Erro em editar.produto.php: " . $e->getMessage());
    echo json_encode([
        "success" => false, 
        "message" => $e->getMessage()
    ]);
}