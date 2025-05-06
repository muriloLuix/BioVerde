<?php
ini_set("display_errors", 1);
session_start();
include_once "../inc/funcoes.inc.php";

header_remove('X-Powered-By');
header('Content-Type: application/json');

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "message" => "Usuário não autenticado!"]);
    exit();
}
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Erro na conexão: " . $conn->connect_error]);
    exit();
}

$rawData = file_get_contents("php://input");
$data    = json_decode($rawData, true);

// 1) Mapa sem o status
$mapaFiltrosUsuario = [
  "fname"         => ['coluna'=>'u.user_nome',       'tipo'=>'like'],
  "femail"        => ['coluna'=>'u.user_email',      'tipo'=>'like'],  // se não usar, remova
  "ftel"          => ['coluna'=>'u.user_telefone',   'tipo'=>'like'],
  "fcpf"          => ['coluna'=>'u.user_CPF',        'tipo'=>'like'],
  "fcargo"        => ['coluna'=>'c.car_nome',        'tipo'=>'like'],
  "fnivel"        => ['coluna'=>'n.nivel_nome',      'tipo'=>'like'],
  "fdataCadastro" => ['coluna'=>'DATE(u.user_dtcadastro)', 'tipo'=>'='],
];

// Gera filtros (exceto status)
$filtros = buildFilters($data, $mapaFiltrosUsuario);

// 2) Trata o status manualmente para pegar "0" também
if (isset($data['fstatus']) && $data['fstatus'] !== "") {
    // garante inteiro 0 ou 1
    $val = intval($data['fstatus']);
    $filtros['where'][] = "u.estaAtivo = {$val}";
}

// 3) Monta SELECT certificando-se de que o CASE vem **antes** do estaAtivo
$buscaUsuario = [
  'select' => "
    u.user_id,
    u.user_nome,
    u.user_email,
    u.user_telefone,
    u.user_CPF,
    c.car_nome,
    n.nivel_nome,

    CASE 
      WHEN u.estaAtivo = 1 THEN 'ATIVO' 
      ELSE 'INATIVO' 
    END AS status_ativo,

    u.estaAtivo      AS estaAtivo,

    u.user_dtcadastro
  ",
  'from' => "usuarios u",
  'joins' => [
    "INNER JOIN cargo c          ON u.car_id    = c.car_id",
    "INNER JOIN niveis_acesso n  ON u.nivel_id  = n.nivel_id",
  ],
  'modificadores' => [
    'user_dtcadastro' => 'DATE(u.user_dtcadastro)'
  ]
];

$usuarios = findFilters($conn, $buscaUsuario, $filtros);

echo json_encode([
  "success"  => true,
  "message"  => "Filtro aplicado com sucesso!",
  "usuarios" => $usuarios
]);

$conn->close();
