<?php
/**************** HEADERS ************************/
session_start();
include_once "../inc/funcoes.inc.php";
require_once "../MVC/Model.php";
require_once "../usuarios/User.class.php";
header('Content-Type: application/json');
verificarAutenticacao($conn, $_SESSION['user_id']);
/*************************************************/
try {

    /**************** INSTÂNCIA AS CLASSES ************************/
    $user_id = $_SESSION['user_id'];
    $user = Usuario::find($user_id);
    /**************************************************************/

    /**************** RECEBE AS INFORMAÇÕES DO FRONT-END ************************/
    $rawData = file_get_contents("php://input");
    if (!$rawData) {
        throw new Exception("Erro ao receber os dados.");
    }

    $data = json_decode($rawData, true);
    /***************************************************************************/

    /**************** VALIDACAO DOS CAMPOS ************************/
    $camposObrigatorios = ['etapa_nome_id', 'etor_tempo', 'etor_unidade'];
    $validacaoDosCampos = validarCampos($data, $camposObrigatorios);
    if ($validacaoDosCampos !== null) {
        echo json_encode($validacaoDosCampos);
        exit();
    }
    /**************************************************************/

    /**************** BUSCA O ID DO PRODUTO FINAL ************************/
    $produto = $data['produto_final'];
    $buscaProdutoId = $conn->prepare("SELECT etapa_id FROM etapas_producao WHERE etapa_produtoNome = ?");
    $buscaProdutoId->bind_param("s", $produto);
    $buscaProdutoId->execute();
    $resultProduto = $buscaProdutoId->get_result();
    $idProduto = $resultProduto->fetch_assoc();

    if (!$idProduto) {
        throw new Exception("Produto não encontrado na lista de Produtos com Etapas.");
    }

    $produtoId = (int) $idProduto['etapa_id'];
    /*******************************************************************/

    /**************** VERIFICA SE O NOME DA ETAPA EXISTE ************************/
    $nomeEtapaId = (int) $data['etapa_nome_id'];
    $buscaEtapaId = $conn->prepare("SELECT etapa_nome_id, etapa_nome FROM etapa_nomes WHERE etapa_nome_id = ?");
    $buscaEtapaId->bind_param("i", $nomeEtapaId);
    $buscaEtapaId->execute();
    $resultEtapaId = $buscaEtapaId->get_result();
    $idEtapa = $resultEtapaId->fetch_assoc();

    if (!$idEtapa) {
        throw new Exception("Nome da Etapa não encontrado.");
    }

    $nomeEtapa = (int) $idEtapa['etapa_nome'];
    /***************************************************************************/

    /************* FAZER CONTAGEM DE QUANTAS ETAPAS ESSE PRODUTO POSSUI E SETA SUA ORDEM ****************/
    $etapaOrdem = 1;
    $consultaOrdem = $conn->prepare("SELECT COUNT(*) as total FROM etapa_ordem WHERE producao_id = ?");
    $consultaOrdem->bind_param("i", $produtoId);
    $consultaOrdem->execute();
    $resultOrdem = $consultaOrdem->get_result();
    $totalEtapas = $resultOrdem->fetch_assoc();

    if ($totalEtapas && $totalEtapas['total'] > 0) {
        $etapaOrdem = (int) $totalEtapas['total'] + 1;
    }
    /****************************************************************************************************/

    /**************** FORMATA OS INSUMOS ************************/
    $insumosArray = $data['etor_insumos'];
    $insumosFormatado = implode(', ', $insumosArray);
    /************************************************************/

    /**************** CADASTRAR A ETAPA ************************/
    $sql = "INSERT INTO etapa_ordem (etor_ordem, etor_nome_id, etor_tempo, etor_unidade, etor_insumos, etor_observacoes, producao_id)";
    $sql .= " VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Erro ao preparar o cadastro: " . $conn->error);
    }

    $stmt->bind_param(
        "iissssi",
        $etapaOrdem,
        $nomeEtapaId,
        $data['etor_tempo'],
        $data['etor_unidade'],
        $insumosFormatado,
        $data['etor_observacoes'],
        $produtoId
    );

    if (!$stmt->execute()) {
        throw new Exception("Erro ao cadastrar Etapa: " . $stmt->error);
    }
    /*********************************************************/

    /**************** LOG DE SUCESSO ************************/
    $etapasStr =
        "Ordem: {$etapaOrdem}\n" .
        "Etapa {$nomeEtapa}\n" .
        "Insumos {$insumosFormatado}\n" .
        formatarEtapasLog([$data]);

    SalvarLog(
        "Usuário ({$user->user_id} - {$user->user_nome}) cadastrou etapas para o produto {$produtoId}:\n\n{$etapasStr}",
        Acoes::CADASTRAR_ETAPA,
        "sucesso"
    );

    echo json_encode(["success" => true, "message" => "Etapa cadastrada com sucesso!"]);

} catch (Exception $e) {
    /**************** LOG DE ERRO ************************/
    $etapasStr = !empty($data) ?
        "Ordem: {$etapaOrdem}\n" .
        "Etapa {$nomeEtapa}\n" .
        "Insumos {$insumosFormatado}\n" .
        formatarEtapasLog([$data]) : '';

    SalvarLog(
        "Erro ao cadastrar etapas para o produto {$produtoId}.\nMotivo: {$e->getMessage()}\nEtapas:\n{$etapasStr}",
        Acoes::CADASTRAR_ETAPA,
        "erro"
    );

    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
