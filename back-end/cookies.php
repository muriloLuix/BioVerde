<?php 

session_set_cookie_params([
    'lifetime' => 3600,  // 1 hora
    'path' => '/',  // Garantir que o cookie seja acessível por todo o domínio
    'domain' => $_SERVER['HTTP_HOST'],  // Usar o domínio correto
    'secure' => false,  // Se o site não usar HTTPS, defina como false
    'httponly' => true,  // Segurança adicional, para que o cookie não seja acessado via JavaScript
    'samesite' => 'Lax'  // Evitar problemas com cookies entre sites
]);

?>