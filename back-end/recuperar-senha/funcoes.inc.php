<?php 

include("../inc/ambiente.inc.php");
include("../cors.php");
include("../log/log.php");

function verificarSenhaAtual($conn, $email, $novaSenha) {
    $sql = "SELECT user_senha FROM usuarios WHERE user_email = ?";
    $res = $conn->prepare($sql);
    $res->bind_param("s", $email);
    $res->execute();
    $res->store_result();
    
    if ($res->num_rows > 0) {
        $res->bind_result($senhaArmazenada);
        $res->fetch();
        
        // Verificar se a nova senha é igual à atual
        if (password_verify($novaSenha, $senhaArmazenada)) {
            return true;
        }
    }
    return false;
}

function atualizarSenha($conn, $email, $novaSenha) {
    $senhaHash = password_hash($novaSenha, PASSWORD_DEFAULT);
    
    $sql = "UPDATE usuarios SET user_senha = ? WHERE user_email = ?";
    $res = $conn->prepare($sql);
    $res->bind_param("ss", $senhaHash, $email);
    $res->execute();
    
    if ($res->affected_rows > 0) {
        return true;
    } else {
        return false;
    }
}



?>