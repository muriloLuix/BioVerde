<?php

function salvarLog($conn, $log_conteudo, $log_acao, $log_status = "sucesso") {
    // Verificar se a conexão e sessão estão disponíveis
    if (!$conn || !isset($_SESSION['user_id'])) {
        return false;
    }

    $log_ip = $_SERVER['REMOTE_ADDR']; 
    $log_datahora = date('Y-m-d H:i:s'); 
    $log_pag_id = basename($_SERVER['PHP_SELF']);

    // Buscar o ID da ação
    $aco_id = null;
    $sql = "SELECT aco_id FROM acoes WHERE aco_nome LIKE CONCAT('%', ?, '%')";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $log_acao);
    $stmt->execute();
    $res = $stmt->get_result();
    
    if ($acaoData = $res->fetch_assoc()) {
        $aco_id = $acaoData['aco_id'];
    }
    $stmt->close();

    // Buscar dados do usuário
    $user_id = $_SESSION['user_id'];
    $log_user_nome = 'Desconhecido';
    
    $sql = 'SELECT user_nome FROM usuarios WHERE user_id = ?';
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $res = $stmt->get_result();
    
    if ($userData = $res->fetch_assoc()) {
        $log_user_nome = $userData['user_nome'];
    }
    $stmt->close();

    $log_url = $_SERVER['REQUEST_URI']; 
    $log_user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'Desconhecido'; 
    $log_referencia = $_SERVER['HTTP_REFERER'] ?? 'Desconhecido';

    // Inserir no log
    $sql = "INSERT INTO log (log_user_id, log_user_nome, log_datahora, log_pag_id, log_url, log_acao, log_conteudo, log_ip, log_user_agent, log_status, log_referencia, aco_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("issssssssssi", $user_id, $log_user_nome, $log_datahora, $log_pag_id, $log_url, $log_acao, $log_conteudo, $log_ip, $log_user_agent, $log_status, $log_referencia, $aco_id);
    
    $result = $stmt->execute();
    $stmt->close();

    return $result;
}

?>