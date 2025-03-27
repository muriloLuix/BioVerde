<?php

function salvarLog($conn, $log_conteudo, $log_acao, $log_status = "sucesso") {
    $log_ip = $_SERVER['REMOTE_ADDR']; 
    $log_datahora = date('Y-m-d H:i:s'); 
    $log_pag_id = basename($_SERVER['PHP_SELF']);

    $sql = 'SELECT user_id, user_nome FROM usuarios WHERE user_id = ?';
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $_SESSION['user_id']);
    $stmt->execute();
    $res = $stmt->get_result();
    $userData = $res->fetch_assoc();

    $log_user_id = $userData['user_id']; 
    $log_url = $_SERVER['REQUEST_URI']; 
    $log_user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'Desconhecido'; 
    $log_referencia = $_SERVER['HTTP_REFERER'] ?? 'Desconhecido';

    $sql = "INSERT INTO log (log_user_id, log_datahora, log_pag_id, log_url, log_acao, log_conteudo, log_ip, log_user_agent, log_status, log_referencia) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isssssssss", $log_user_id, $log_datahora, $log_pag_id, $log_url, $log_acao, $log_conteudo, $log_ip, $log_user_agent, $log_status, $log_referencia);
    $stmt->execute();
    $stmt->close();
}

?>