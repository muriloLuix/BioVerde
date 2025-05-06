<?php
ini_set("display_errors", 1);
session_start();

include_once "../inc/funcoes.inc.php";

header_remove('X-Powered-By');
header('Content-Type: application/json');

try {
    // Verifica autenticação
    if (!isset($_SESSION["user_id"])) {
        checkLoggedUSer($conn, $_SESSION['user_id']);
        exit;
    }

    // Verifica conexão com o banco
    if ($conn->connect_error) {
        throw new Exception("Erro na conexão com o banco: " . $conn->connect_error);
    }

    // Recebe JSON do front
    $rawData = file_get_contents("php://input");
    if (!$rawData) {
        throw new Exception("Erro ao receber os dados.");
    }
    $data = json_decode($rawData, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON inválido: " . json_last_error_msg());
    }

    // Valida campos obrigatórios (agora incluindo 'status')
    $requiredFields = ['user_id', 'name', 'email', 'tel', 'cpf', 'cargo', 'nivel'];
    $validacao = validarCampos($data, $requiredFields);
    if ($validacao) {
        throw new Exception($validacao['message']);
    }

    // Validação de email
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Email inválido");
    }

    // Usuário existe?
    if (!verifyExist($conn, $data["user_id"], "user_id", "usuarios")) {
        throw new Exception("Usuário não encontrado");
    }

    // Conflitos de email/CPF
    $conflito = verificarConflitosAtualizacao($conn, $data['email'], $data['cpf'], $data['user_id']);
    if ($conflito) {
        throw new Exception($conflito['message']);
    }

    // Resolve IDs de cargo e nível
    $cargoId = verificarCargo($conn, $data['cargo']);
    if (isset($cargoId['success']) && !$cargoId['success']) {
        throw new Exception($cargoId['message']);
    }
    $nivelId = verificarNivel($conn, $data['nivel']);
    if (isset($nivelId['success']) && !$nivelId['success']) {
        throw new Exception($nivelId['message']);
    }

    // Converte o status (string "1" ou "0") para inteiro
    $statusValue = (int)$data['status'];  // 1 = ativo, 0 = inativo

    // Prepara update
    $camposAtualizados = [
        'user_nome'     => $data['name'],
        'user_email'    => $data['email'],
        'user_telefone' => $data['tel'],
        'user_CPF'      => $data['cpf'],
        'car_id'        => $cargoId,
        'nivel_id'      => $nivelId,
        'estaAtivo'     => $statusValue,
    ];

    // Executa update
    $resultado = updateData($conn, 'usuarios', $camposAtualizados, $data['user_id'], 'user_id');
    if (!$resultado['success']) {
        throw new Exception($resultado['message'] ?? "Erro ao atualizar usuário");
    }

    // Busca o usuário já atualizado, trazendo também o texto ATIVO/INATIVO
    $fields = "
        u.user_id,
        u.user_nome,
        u.user_email,
        u.user_telefone,
        u.user_CPF,
        c.car_nome,
        n.nivel_nome,
        u.estaAtivo AS estaAtivo,
        CASE 
          WHEN u.estaAtivo = 1 THEN 'ATIVO' 
          ELSE 'INATIVO' 
        END AS status_ativo,
        u.user_dtcadastro,
        u.car_id,
        u.nivel_id
    ";

    $joins = [
        ['type' => 'INNER', 'join_table' => 'cargo c', 'on' => 'u.car_id = c.car_id'],
        ['type' => 'INNER', 'join_table' => 'niveis_acesso n', 'on' => 'u.nivel_id = n.nivel_id'],
    ];

    $usuarioAtualizado = searchPersonPerID($conn, $data['user_id'], 'usuarios u', $fields, $joins);

    echo json_encode([
        "success" => true,
        "message" => "Usuário atualizado com sucesso!",
        "usuario" => $usuarioAtualizado
    ]);

} catch (Exception $e) {
    error_log("Erro em editar.usuario.php: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
} finally {
    if (isset($conn) && $conn) {
        $conn->close();
    }
}
