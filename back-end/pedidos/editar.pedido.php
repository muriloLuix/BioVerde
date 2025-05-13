<?php
ini_set("display_errors", 1);
session_start();

include_once "../inc/funcoes.inc.php";

header_remove('X-Powered-By');
header('Content-Type: application/json');

ini_set("display_errors",1);
session_start();

include_once "../inc/funcoes.inc.php";

// configurarSessaoSegura();

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

    var_dump($data['nome_cliente']);
        exit;

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
    $sql = "SELECT cliente_id, cliente_nome_ou_empresa FROM clientes WHERE cliente_nome_ou_empresa = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $data['nome_cliente']);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {

    }

    $camposAtualizados = [
        'cliente_id' => $data['nome_cliente'],
        'fornecedor_razao_social' => $data['tel'],
        'fornecedor_email' => $data['cep'],
        'fornecedor_telefone' => $data['status'],
        'fornecedor_tipo' => $data['endereco'],
        'fornecedor_cpf_ou_cnpj' => $data['num_endereco'],
        'fornecedor_responsavel' => $data['estado'],
        'fornecedor_cep' => $data['cidade'],
        'fornecedor_endereco' => $data['prev_entrega'],
        'fornecedor_num_endereco' => $data['obs']
    ];

} catch (Exception $e) {
    error_log("Erro em editar.pedido.php: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>