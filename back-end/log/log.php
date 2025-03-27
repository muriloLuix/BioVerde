<?php 


function salvarLog($conn, $log_conteudo){
    $log_ip = $_SERVER['REMOTE_ADDR'];
    $log_datahora = date('Y-m-d H:i:s');
    $pag_id = basename($_SERVER['PHP_SELF']);
    $user_id = isset( $_SESSION['user_id'] ) ? $_SESSION['user_id'] : null;

    $sql = 'INSERT INTO log (log_user_id, log_datahora, log_pag_id, log_conteudo, log_ip) VALUES (?, ?, ?, ?, ?)';
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('issss', $user_id, $log_datahora, $pag_id, $log_conteudo, $log_ip);
    $stmt->execute();
    $stmt->close();
}


?>