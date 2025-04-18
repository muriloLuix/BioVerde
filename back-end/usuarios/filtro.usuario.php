<?php 

ini_set("display_errors", 1);

session_start();

include_once "../inc/funcoes.inc.php";

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
$data = json_decode($rawData, true);

// Define o mapa de filtros para usuários
$mapaFiltrosUsuario = [
    "fname"         => ['coluna' => 'user_nome',      'tipo' => 'like'],
    "femail"        => 'user_email',
    "ftel"          => 'user_telefone',
    "fcpf"          => 'user_CPF',
    "fcargo"        => 'car_nome',
    "fnivel"        => 'nivel_nome',
    "fstatus"       => 'sta_id',
    "fdataCadastro" => 'user_dtcadastro',
];

// Gera os filtros
$filtros = buildFilters($data, $mapaFiltrosUsuario);

// Substitui colunas ambíguas por aliases corretos
if (isset($filtros['where'])) {
    $filtros['where'] = array_map(function($condition) {
        return preg_replace([
            '/\bsta_id\b/',
            '/\bcar_id\b/',
            '/\bnivel_id\b/'
        ], [
            'u.sta_id',
            'u.car_id',
            'u.nivel_id'
        ], $condition);
    }, $filtros['where']);
}

// Define a estrutura da consulta de usuários
$buscaUsuario = [
    'select' => "u.user_id, u.user_nome, u.user_email, u.user_telefone, u.user_CPF, u.user_dtcadastro, u.sta_id, u.car_id, u.nivel_id, s.sta_nome, c.car_nome, n.nivel_nome",
    'from' => "usuarios u",
    'joins' => [
        "LEFT JOIN status s ON u.sta_id = s.sta_id",
        "LEFT JOIN cargo c ON u.car_id = c.car_id",
        "LEFT JOIN niveis_acesso n ON u.nivel_id = n.nivel_id"
    ],
    'modificadores' => [
        'user_dtcadastro' => 'DATE(user_dtcadastro)'
    ]
];

// Executa a busca
$usuarios = findFilters($conn, $buscaUsuario, $filtros);


// Retorna a resposta
echo json_encode([
    "success" => true,
    "message" => "Filtro aplicado com sucesso!",
    "usuarios" => $usuarios
]);

$conn->close();