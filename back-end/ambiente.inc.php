<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Configuração do banco de dados remoto
define('DB_HOST', '162.241.203.227'); // IP do servidor
define('DB_USER', 'goecho42_murilo_echo'); // Usuário do banco
define('DB_PASS', 'Murylindos1204*'); // Senha do banco
define('DB_NAME', 'goecho42_bioverde'); // Nome do banco
define('DB_PORT', 3306); // Porta padrão do MySQL

// Criar conexão com MySQLi
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);

// Verificar conexão
if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Erro na conexão com o banco de dados: " . $conn->connect_error]));
} else {
    // echo "Conectou com sucesso!";
}
?>
