<?php


// Configuração do banco de dados remoto
define('DB_HOST', '162.241.203.227'); 
define('DB_USER', 'goecho42_fernando_echo'); 
define('DB_PASS', 'Echo2024*'); 
define('DB_NAME', 'goecho42_bioverde'); 
define('DB_PORT', 3306);

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);

// Verificar conexão
if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Erro na conexão com o banco de dados: " . $conn->connect_error]));
} else {
    // echo "Conectou com sucesso!";
}
?>
