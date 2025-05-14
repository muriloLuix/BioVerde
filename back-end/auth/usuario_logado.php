<?php 

ini_set("display_errors", 1);
session_start();
include_once("../inc/funcoes.inc.php");
checkLoggedUser($conn, $_SESSION['user_id']);

header('Content-Type: application/json');

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Erro na conexão com o banco de dados: " . $conn->connect_error]));
}

$usuarioId = $_SESSION['user_id'];

// Fazendo JOIN com a tabela niveis_acesso
$sql = "SELECT u.user_nome, n.nivel_nome 
        FROM usuarios u
        LEFT JOIN niveis_acesso n ON u.nivel_id = n.nivel_id
        WHERE u.user_id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $usuarioId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    die(json_encode(["success" => false, "message" => "Usuário não encontrado."]));
}

$row = $result->fetch_assoc();

// Quebrar o nome
$nomes = explode(" ", trim($row['user_nome']));
$primeiroNome = $nomes[0];
$ultimoNome = count($nomes) > 2 ? $nomes[count($nomes) - 1] : (isset($nomes[1]) ? $nomes[1] : '');
$nomeFinal = $primeiroNome . ($ultimoNome ? " " . $ultimoNome : '');

// Retorno JSON com nome e nível
echo json_encode([
    "success" => true,
    "userName" => $nomeFinal,
    "userLevel" => $row['nivel_nome']
]);
