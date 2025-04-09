<?php 

session_start();

include_once "../inc/funcoes.inc.php";

// configurarSessaoSegura();

header_remove('X-Powered-By');
header('Content-Type: application/json');

try {
    // Verifica autenticação
    if (!isset($_SESSION["user_id"])) {
        throw new Exception("Usuário não autenticado!");
    }

    // Verifica conexão com o banco
    if ($conn->connect_error) {
        throw new Exception("Erro na conexão com o banco: " . $conn->connect_error);
    }

    // Processa os dados de entrada
    $rawData = file_get_contents("php://input");

    if (!$rawData) {
        throw new Exception("Erro ao receber os dados.");
    }

    $data = json_decode($rawData, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON inválido: " . json_last_error_msg());
    }

    // Validação dos campos obrigatórios
    $requiredFields = ['user_id', 'name', 'email', 'tel', 'cpf', 'cargo', 'nivel'];
    $validacao = validarCampos($data, $requiredFields);
    if ($validacao) {
        throw new Exception($validacao['message']);
    }

    // Validações específicas
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Email inválido");
    }

    // Verifica se o usuário existe
    if (!verificarUsuarioExiste($conn, $data['user_id'])) {
        throw new Exception("Usuário não encontrado.");
    }

    // Verifica conflitos
    $conflito = verificarConflitosAtualizacao($conn, $data['email'], $data['cpf'], $data['user_id']);
    if ($conflito) {
        throw new Exception($conflito['message']);
    }

    // Verifica cargo e nível
    $cargoId = verificarCargo($conn, $data['cargo']);
    if (isset($cargoId['success']) && !$cargoId['success']) {
        throw new Exception($cargoId['message']);
    }

    $nivelId = verificarNivel($conn, $data['nivel']);
    if (isset($nivelId['success']) && !$nivelId['success']) {
        throw new Exception($nivelId['message']);
    }

    if (isset($data['status'])) {
        $statusId = obterIdStatusPorNome($conn, $data['status']);
        
        // Se a função retornar array, é porque deu erro
        if (is_array($statusId)) {
            throw new Exception($statusId['message']);
        }
        
        // Adiciona o ID do status aos dados com o nome correto que a função espera
        $data['sta_id'] = $statusId;
    }

    // Atualiza usuário
    $resultado = atualizarUsuario($conn, $data['user_id'], $data);
    if (!$resultado['success']) {
        throw new Exception($resultado['message'] ?? "Erro ao atualizar usuário");
    }

    $usuarioAtualizado = buscarUsuarioPorId($conn, $data['user_id']);

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