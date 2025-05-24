<?php
/**************** HEADERS ************************/
session_start();
include_once "../inc/funcoes.inc.php";
require_once "../MVC/Model.php";
require_once "../usuarios/User.class.php";
require_once "../fornecedores/Fornecedor.class.php";
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
    /**************************************************************/

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
    /***************************************************************************/

    /**************** VALIDAÇÃO DOS CAMPOS ************************/
    $camposObrigatorios = ['nome_empresa_fornecedor', 'email', 'tel', 'tipo', 'cpf_cnpj', 'responsavel', 'cep', 'endereco', 'estado', 'cidade', 'num_endereco'];
    $validacaoDosCampos = validarCampos($data, $camposObrigatorios);

    if ($validacaoDosCampos !== null) {
        echo json_encode($validacaoDosCampos);
        exit();
    }

    $verifiedDocuments = verifyDocuments($data['cpf_cnpj'], $data['tipo']);

    if ($verifiedDocuments['success'] === false) {
        echo json_encode($verifiedDocuments);
        exit();
    }

    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Email inválido");
    }

    if (!verifyExist($conn, $data["fornecedor_id"], "fornecedor_id", "fornecedores")) {
        throw new Exception("Fornecedor nao encontrado");
    }
    /************************************************************/

    /**************** VERIFICAR EMAIL E CNPJ************************/
    $colunas = ["fornecedor_email", "fornecedor_documento"];
    $valores = [$data["email"], $data["cpf_cnpj"]];

    $conflito = verificarConflitosAtualizacao($conn, "fornecedores", $colunas, $valores, "fornecedor_id", $data["fornecedor_id"]);
    if ($conflito) {
        throw new Exception($conflito['message']);
    }
    /***************************************************************/

    // Converte o status (string "1" ou "0") para inteiro
    $statusValue = (int)$data['status'];  // 1 = ativo, 0 = inativo

    /**************** ATUALIZA FORNECEDOR ************************/

    $fornecedorAntigo = Fornecedor::find($data['fornecedor_id']);

    $camposAtualizados = [
        'fornecedor_nome' => $data['nome_empresa_fornecedor'],
        'fornecedor_razao_social' => $data['razao_social'],
        'fornecedor_email' => $data['email'],
        'fornecedor_telefone' => $data['tel'],
        'fornecedor_tipo' => $data['tipo'],
        'fornecedor_documento' => $data['cpf_cnpj'],
        'fornecedor_responsavel' => $data['responsavel'],
        'fornecedor_cep' => $data['cep'],
        'fornecedor_endereco' => $data['endereco'],
        'fornecedor_num_endereco' => $data['num_endereco'],
        'fornecedor_complemento' => $data['complemento'],
        'fornecedor_cidade' => $data['cidade'],
        'fornecedor_estado' => $data['estado'],
        'estaAtivo' => $statusValue,
    ];

    $resultado = updateData($conn, 'fornecedores', $camposAtualizados, $data['fornecedor_id'], 'fornecedor_id');
    if (!$resultado['success']) {
        throw new Exception($resultado['message'] ?? "Erro ao atualizar fornecedor");
    }

    $fields = "
    f.fornecedor_id,
    f.fornecedor_nome,
    f.fornecedor_email,
    f.fornecedor_telefone,
    f.fornecedor_tipo,
    f.fornecedor_documento,
    f.fornecedor_cep,
    f.fornecedor_endereco,
    f.fornecedor_num_endereco,
    f.fornecedor_complemento,
    f.fornecedor_estado,
    f.fornecedor_cidade,
    f.fornecedor_responsavel,
    f.fornecedor_razao_social,
    f.fornecedor_dtcadastro,
    f.estaAtivo
    ";

    $fornecedor = searchPersonPerID($conn, $data['fornecedor_id'], 'fornecedores f', $fields, [], 'f.fornecedor_id');

    $fornecedorId = Fornecedor::find($data['fornecedor_id']);

    echo json_encode([
        "success" => true,
        "message" => "Fornecedor atualizado com sucesso!",
        "fornecedor" => $fornecedor
    ]);
    /************************************************************/

    /**************** COMPARA OS CAMPOS ************************/
    $alteracoes = [];
    foreach ($camposAtualizados as $campo => $novoValor) {
        $campoAntigo = $fornecedorAntigo->$campo ?? null;
        // Normalizar valores para comparação
        if (is_null($campoAntigo)) $campoAntigo = '';
        if (is_null($novoValor)) $novoValor = '';

        if ($campoAntigo != $novoValor) {
            $alteracoes[] = "Campo: $campo | De: '$campoAntigo' Para: '$novoValor'";
        }
    }
    /***********************************************************/

    /**************** MONTA A MENSAGEM DE LOG ************************/
    $logMensagem = "O usuário ({$user->user_id} - {$user->user_nome}), editou o fornecedor: ({$fornecedorId->fornecedor_nome}).\n\n";
    if (!empty($alteracoes)) {
        $logMensagem .= "Alterações:\n\n" . implode("\n", $alteracoes);
    } else {
        $logMensagem .= "Nenhuma alteração detectada.";
    }
    /***********************************************************/

    salvarLog($logMensagem, Acoes::EDITAR_FORNECEDOR, "sucesso");


} catch (Exception $e) {
    error_log("Erro em editar.fornecedor.php: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
    salvarLog("O usuário ({$user->user_id} - {$user->user_nome}), tentou editar o fornecedor. \n\nErro: {$e->getMessage()}", Acoes::EDITAR_FORNECEDOR, "sucesso");
}