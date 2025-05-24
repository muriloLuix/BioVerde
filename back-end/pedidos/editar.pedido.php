<?php
ini_set("display_errors", 1);
session_start();
header_remove('X-Powered-By');
header('Content-Type: application/json');
include_once "../inc/funcoes.inc.php";

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

    // Validação dos campos obrigatórios
    $camposObrigatorios = ['nome_cliente', 'tel', 'cep', 'status', 'endereco', 'num_endereco', 'estado', 'cidade', 'prev_entrega', 'obs'];
    $validacaoDosCampos = validarCampos($data, $camposObrigatorios);
    if ($validacaoDosCampos !== null) {
        echo json_encode($validacaoDosCampos);
        exit();
    }

    if (!verifyExist($conn, $data["pedido_id"], "pedido_id", "pedidos")) {
        throw new Exception("Pedido nao encontrado");
    }

    // Pesquisar id pelo nome
    $sql = "SELECT cliente_id FROM clientes WHERE cliente_nome = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $data['nome_cliente']);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        throw new Exception("Cliente não encontrado");
    }
    $row = $result->fetch_assoc();
    $id_cliente = $row['cliente_id'];

    $camposAtualizados = [
        'cliente_id' => $id_cliente,
        'pedido_cep' => $data['cep'],
        'stapedido_id' => $data['status'],
        'pedido_endereco' => $data['endereco'],
        'pedido_num_endereco' => $data['num_endereco'],
        'pedido_estado' => $data['estado'],
        'pedido_cidade' => $data['cidade'],
        'pedido_prevEntrega' => $data['prev_entrega'],
        'pedido_observacoes' => $data['obs'],
        'pedido_telefone' => $data['tel']
    ];
    // Executa update
    $resultado = updateData($conn, 'pedidos', $camposAtualizados, $data['pedido_id'], 'pedido_id');
    if (!$resultado['success']) {
        throw new Exception($resultado['message'] ?? "Erro ao atualizar usuário");
    }

    echo json_encode([
        "success" => true,
        "message" => "Pedido atualizado com sucesso!",
    ]);

} catch (Exception $e) {
    error_log("Erro em editar.usuario.php: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
} finally {
    if (isset($conn) && $conn) {
        $conn->close();
    }
}
?>