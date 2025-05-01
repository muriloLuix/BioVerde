<?php

/**
 * Registra um evento de log no banco de dados.
 *
 * @param string      $log_conteudo Descrição detalhada do evento ou ação a ser registrada.
 * @param string      $log_acao     Nome ou identificação da ação realizada.
 * @param string      $log_status   Status do evento, padrão é "sucesso".
 * @param int|null    $user_id      (Opcional) ID do usuário que realizou a ação; se omitido, pega da sessão.
 *
 * @return bool Retorna true se o log foi salvo com sucesso, false caso contrário.
 */
function salvarLog(string $log_conteudo, $acao, string $log_status = "sucesso", int $user_id = null) {
    global $conn;
    if (!$conn) return false;

    // 1) resolve $aco_id e $log_acao
    $aco_id = null;
    // se vier numérico, usamos direto como ID:
    if (is_int($acao) || ctype_digit($acao)) {
        $aco_id = (int)$acao;
        // buscamos o nome correspondente pra gravar em log_acao
        $sql = "SELECT aco_nome FROM acoes WHERE aco_id = ? LIMIT 1";
        if ($st = $conn->prepare($sql)) {
            $st->bind_param("i", $aco_id);
            $st->execute();
            $r = $st->get_result()->fetch_assoc();
            $log_acao = $r['aco_nome'] ?? "acao_desconhecida";
            $st->close();
        } else {
            $log_acao = "acao_desconhecida";
        }
    }
    // se veio string, tentamos mapear pra ID (case-insensitive exato):
    else {
        $log_acao = (string)$acao;
        $sql = "SELECT aco_id FROM acoes WHERE LOWER(aco_nome) = LOWER(?) LIMIT 1";
        if ($st = $conn->prepare($sql)) {
            $st->bind_param("s", $log_acao);
            $st->execute();
            $r = $st->get_result()->fetch_assoc();
            $aco_id = $r['aco_id'] ?? null;
            $st->close();
        }
    }

    // 2) pega o user da sessão, se não veio por parâmetro
    if ($user_id === null && session_status() === PHP_SESSION_ACTIVE) {
        $user_id = $_SESSION['user_id'] ?? null;
    }

    // 3) coleta IP, data, página etc…
    $log_ip         = $_SERVER['REMOTE_ADDR'];
    $log_datahora   = date('Y-m-d H:i:s');
    $log_pag_id     = basename($_SERVER['PHP_SELF']);
    $log_url        = $_SERVER['REQUEST_URI'];
    $log_user_agent = $_SERVER['HTTP_USER_AGENT']  ?? 'Desconhecido';
    $log_referencia = $_SERVER['HTTP_REFERER']    ?? 'Desconhecido';

    // 4) busca nome do usuário
    $log_user_nome = 'Desconhecido';
    if ($user_id && is_numeric($user_id)) {
        $sql = "SELECT user_nome FROM usuarios WHERE user_id = ? LIMIT 1";
        if ($st = $conn->prepare($sql)) {
            $st->bind_param("i", $user_id);
            $st->execute();
            $r = $st->get_result()->fetch_assoc();
            $log_user_nome = $r['user_nome'] ?? $log_user_nome;
            $st->close();
        }
    }

    // 5) insere no log
    $sql = "INSERT INTO log (
                log_user_id, log_user_nome, log_datahora, log_pag_id,
                log_url, log_acao, log_conteudo,
                log_ip, log_user_agent, log_status,
                log_referencia, aco_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $st = $conn->prepare($sql);
    if (!$st) {
        error_log("Erro ao preparar statement: ".$conn->error);
        return false;
    }
    $st->bind_param(
        "issssssssssi",
        $user_id,
        $log_user_nome,
        $log_datahora,
        $log_pag_id,
        $log_url,
        $log_acao,
        $log_conteudo,
        $log_ip,
        $log_user_agent,
        $log_status,
        $log_referencia,
        $aco_id
    );
    $ok = $st->execute();
    if (!$ok) error_log("Erro ao executar log: ".$st->error);
    $st->close();
    return $ok;
}
