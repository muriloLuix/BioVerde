<?php
/**************** HEADERS ************************/
session_start();
include_once "../inc/funcoes.inc.php";
require_once "../MVC/Model.php";
require_once "../usuarios/User.class.php";
require_once "../clientes/Clientes.class.php";
header_remove('X-Powered-By');
header('Content-Type: application/json');
/************************************************/

try {
    /**************** VERIFICA A AUTENTICAÇÃO ************************/
    if (!isset($_SESSION["user_id"])) {
        checkLoggedUser($conn, $_SESSION['user_id']);;
        exit;
    }

    $user_id = $_SESSION['user_id'];
    $user = Usuario::find($user_id);
    /*****************************************************************/

    /**************** VERIFICA A CONEXÃO COM O BANCO ************************/
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
    /************************************************************************/

    /**************** VALIDAÇÃO DOS DADOS ************************/
    if (!verifyExist($conn, $data['cliente_id'], 'cliente_id', 'clientes')) {
        throw new Exception('Cliente não encontrado');
    }

    $camposObrigatorios = ['cliente_id', 'nome_empresa_cliente', 'tipo', 'email', 'tel', 'cpf_cnpj', 'cep', 'endereco', 'num_endereco', 'estado', 'cidade'];
    $validacaoDosCampos = validarCampos($data, $camposObrigatorios);
    if ($validacaoDosCampos !== null) {
        echo json_encode($validacaoDosCampos);
        exit();
    }

    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Email inválido");
    }
    /**********************************************************/

    // Conflitos de email/CPF/CNPJ
    $colunas = ["cliente_email", "cliente_documento"];
    $valores = [$data["email"], $data["cpf_cnpj"]];

    $conflito = verificarConflitosAtualizacao($conn, "clientes", $colunas, $valores, "cliente_id", $data["cliente_id"]);
    if ($conflito) {
        throw new Exception($conflito['message']);
    }
    /********************************************************************/

    // Converte o status (string "1" ou "0") para inteiro
    $statusValue = (int)$data['status'];  // 1 = ativo, 0 = inativo

    $clienteAntigo = Clientes::find($data['cliente_id']);

    /**************** ATUALIZA O CLIENTE ************************/
    $camposAtualizados = [
        'cliente_nome' => $data['nome_empresa_cliente'],
        'cliente_razao_social' => $data['razao_social'],
        'cliente_tipo' => $data['tipo'],
        'cliente_email' => $data['email'],
        'cliente_telefone' => $data['tel'],
        'cliente_documento' => $data['cpf_cnpj'],
        'cliente_cep' => $data['cep'],
        'cliente_endereco' => $data['endereco'],
        'cliente_numendereco' => $data['num_endereco'],
        'cliente_complemento' => $data['complemento'],
        'cliente_estado' => $data['estado'],
        'cliente_cidade' => $data['cidade'],
        'estaAtivo' => $statusValue,
        'cliente_observacoes' => $data['obs']
    ];

    $resultado = updateData($conn, "clientes", $camposAtualizados, $data['cliente_id'], "cliente_id");
    if (!$resultado['success']) {
        throw new Exception($resultado['message'] ?? "Erro ao atualizar cliente");
    }

    $fields = "
    c.cliente_id,
    c.cliente_nome,
    c.cliente_razao_social,
    c.cliente_email,
    c.cliente_telefone,
    c.cliente_tipo,
    c.cliente_documento,
    c.cliente_cep,
    c.cliente_endereco,
    c.cliente_numendereco,
    c.cliente_complemento,
    c.cliente_estado,
    c.cliente_cidade,
    c.cliente_observacoes,
    c.cliente_data_cadastro,
    c.estaAtivo
    ";

    $joins = [];

    $cliente = searchPersonPerID($conn, $data['cliente_id'], 'clientes c', $fields, $joins, 'c.cliente_id');

    $clienteId = Clientes::find($data['cliente_id']);

    /***********************************************************/

    echo json_encode([
        "success" => true,
        "message" => "Cliente atualizado com sucesso!",
        "usuario" => $cliente
    ]);

    /**************** COMPARA OS CAMPOS ************************/
    $alteracoes = [];
    foreach ($camposAtualizados as $campo => $novoValor) {
        $campoAntigo = $clienteAntigo->$campo ?? null;
        // Normalizar valores para comparação
        if (is_null($campoAntigo)) $campoAntigo = '';
        if (is_null($novoValor)) $novoValor = '';

        if ($campoAntigo != $novoValor) {
            $alteracoes[] = "Campo: $campo | De: '$campoAntigo' Para: '$novoValor'";
        }
    }
    /***********************************************************/

    /**************** MONTA A MENSAGEM DE LOG ************************/
    $logMensagem = "O usuário ({$user->user_id} - {$user->user_nome}), editou o cliente: ({$clienteId->cliente_nome}).";
    if (!empty($alteracoes)) {
        $logMensagem .= "Alterações:\n" . implode("\n", $alteracoes);
    } else {
        $logMensagem .= "Nenhuma alteração detectada.";
    }
    /***********************************************************/

    salvarLog($logMensagem, Acoes::EDITAR_CLIENTE, "sucesso");

} catch (Exception $e) {
    error_log("Erro em editar.cliente.php: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
    salvarLog("O usuário ({$user->user_id} - {$user->user_nome}), tentou editar o cliente: ({$clienteId->cliente_nome} - {$clienteId->cliente_id}). Motivo do erro: {$e->getMessage()}", Acoes::EDITAR_CLIENTE, "erro");
}