<?php 

session_start();

include_once "../inc/funcoes.inc.php";
include_once "../inc/ambiente.inc.php";

configurarSessaoSegura();

header_remove('X-Powered-By');
header('Content-Type: application/json');

// Verifica autenticação
if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "message" => "Usuário não autenticado!"]);
    exit();
}

// Verifica conexão com o banco
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Erro na conexão com o banco de dados: " . $conn->connect_error]);
    exit();
}

// Processa os dados de entrada
$rawData = file_get_contents("php://input");
if (!$rawData) {
    echo json_encode(["success" => false, "message" => "Erro ao receber os dados."]);
    exit();
}

$data = json_decode($rawData, true);

// Obtém os filtros construídos
$filtros = construirFiltrosUsuarios($data);

// Busca os usuários com os filtros aplicados
$usuarios = buscarUsuariosComFiltros($conn, $filtros);

// Retorna a resposta
echo json_encode([
    "success" => true,
    "usuarios" => $usuarios,
    "debug" => [
        "sql" => "SELECT u.user_id, u.user_nome, u.user_email, u.user_telefone, u.user_CPF, 
                         c.car_nome, n.nivel_nome, u.user_dtcadastro 
                  FROM usuarios u 
                  INNER JOIN cargo c ON u.car_id = c.car_id 
                  INNER JOIN niveis_acesso n ON u.nivel_id = n.nivel_id" . 
                 (!empty($filtros['where']) ? " WHERE " . implode(" AND ", $filtros['where']) : ""),
        "valores" => $filtros['valores']
    ]
]);

$conn->close();