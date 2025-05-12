<?php

// Carrega conexão MySQLi do ambiente
include("../inc/ambiente.inc.php");
/**
 * Verifica se o usuário logado tem pelo menos o nível mínimo.
 * Retorna HTTP 403 se não autorizado.
 *
 * @param int $nivelMinimo
 */
function authorize(int $nivelMinimo, string $message = null): void {
    if (!isset($_SESSION['nivel_acesso']) || $_SESSION['nivel_acesso'] < $nivelMinimo) {
        echo json_encode(["success" => false, "message" => $message]);
        exit;
    }
}
/**
 * Retorna o nível mínimo exigido para o recurso, ou null se não definido.
 *
 * @param string $recurso
 * @return int|null
 */
function getMinLevelFor(string $recurso): ?int {
    global $conn; // instancia mysqli definida em ambiente.inc.php

    $sql = "SELECT nivel_minimo FROM permissoes WHERE recurso = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        return null;
    }
    $stmt->bind_param('s', $recurso);
    $stmt->execute();
    $stmt->bind_result($nivelMinimo);

    $result = null;
    if ($stmt->fetch()) {
        $result = (int)$nivelMinimo;
    }
    $stmt->close();
    return $result;
}

