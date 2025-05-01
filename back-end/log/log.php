<?php

/**
 * Registra um evento de log no banco de dados.
 *
 * @param mysqli $conn Conexão ativa com o banco de dados.
 * @param string $log_conteudo Descrição detalhada do evento ou ação a ser registrada.
 * @param string $log_acao Nome ou identificação da ação realizada.
 * @param string $log_status (Opcional) Status do evento, padrão é "sucesso".
 * @param int|null $user_id (Opcional) ID do usuário que realizou a ação, pode ser nulo.
 *
 * @return bool Retorna true se o log foi salvo com sucesso, false caso contrário.
 */

function salvarLog($conn, $log_conteudo, $log_acao, $log_status = "sucesso", $user_id = null) {
    // Verificar conexão válida
    if (!$conn) {
        error_log("Falha ao salvar log: Conexão com banco de dados inválida");
        return false;
    }

    // Coletar informações básicas
    $log_ip = $_SERVER['REMOTE_ADDR']; 
    $log_datahora = date('Y-m-d H:i:s'); 
    $log_pag_id = basename($_SERVER['PHP_SELF']);
    $log_url = $_SERVER['REQUEST_URI']; 
    $log_user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'Desconhecido'; 
    $log_referencia = $_SERVER['HTTP_REFERER'] ?? 'Desconhecido';

    // Buscar o ID da ação (opcional)
    $aco_id = null;
    $sql_acao = "SELECT aco_id FROM acoes WHERE aco_nome LIKE CONCAT('%', ?, '%') LIMIT 1";
    if ($stmt_acao = $conn->prepare($sql_acao)) {
        $stmt_acao->bind_param("s", $log_acao);
        $stmt_acao->execute();
        $res = $stmt_acao->get_result();
        if ($acaoData = $res->fetch_assoc()) {
            $aco_id = $acaoData['aco_id'];
        }
        $stmt_acao->close();
    }

    // Buscar dados do usuário (se existir)
    $log_user_nome = 'Desconhecido';
    if ($user_id && is_numeric($user_id)) {
        $sql_user = 'SELECT user_nome FROM usuarios WHERE user_id = ? LIMIT 1';
        if ($stmt_user = $conn->prepare($sql_user)) {
            $stmt_user->bind_param("i", $user_id);
            $stmt_user->execute();
            $res = $stmt_user->get_result();
            if ($userData = $res->fetch_assoc()) {
                $log_user_nome = $userData['user_nome'];
            }
            $stmt_user->close();
        }
    } else {
        $user_id = null; // Garante que será NULL no banco
    }

    // Inserir no log (com user_id NULL se não existir)
    $sql = "INSERT INTO log (
                log_user_id, log_user_nome, log_datahora, log_pag_id, 
                log_url, log_acao, log_conteudo, log_ip, 
                log_user_agent, log_status, log_referencia, aco_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        error_log("Erro ao preparar statement: " . $conn->error);
        return false;
    }

    $stmt->bind_param(
        "issssssssssi", 
        $user_id,         
        $log_user_nome, 
        $log_datahora, 
        $log_pag_id,
        $log_url, 
        $log_acao, 
        $log_conteudo, 
        $log_ip,
        $log_user_agent, 
        $log_status, 
        $log_referencia, 
        $aco_id
    );
    
    $result = $stmt->execute();
    if (!$result) {
        error_log("Erro ao executar log: " . $stmt->error);
    }
    
    $stmt->close();
    return $result;
}