<?php

include("../inc/ambiente.inc.php");
include("../cors.php");
include("../log/log.php");

function validarCampos($data, $requiredFields) {
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            return ["success" => false, "message" => "O campo " . $field . " é obrigatório."];
        }
    }
    return null;
}

function verificarCargo($conn, $cargo) {
    $stmt = $conn->prepare("SELECT car_id FROM cargo WHERE car_nome = ?");
    if (!$stmt) {
        return ["success" => false, "message" => "Erro ao preparar consulta de cargos: " . $conn->error];
    }
    $stmt->bind_param("s", $cargo);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        return ["success" => false, "message" => "Cargo não encontrado."];
    }
    $cargo = $result->fetch_assoc();
    $stmt->close();
    return $cargo['car_id'];
}

function verificarNivel($conn, $nivel) {
    $stmt = $conn->prepare("SELECT nivel_id FROM niveis_acesso WHERE nivel_nome = ?");
    if (!$stmt) {
        return ["success" => false, "message" => "Erro ao preparar consulta de níveis: " . $conn->error];
    }
    $stmt->bind_param("s", $nivel);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        return ["success" => false, "message" => "Nível de acesso não encontrado."];
    }
    $nivel = $result->fetch_assoc();
    $stmt->close();
    return $nivel['nivel_id'];
}

function verificarEmailCpf($conn, $email, $cpf) {
    $stmt = $conn->prepare("SELECT user_email, user_CPF FROM usuarios WHERE user_email = ? OR user_CPF = ?");
    if (!$stmt) {
        return ["success" => false, "message" => "Erro ao preparar a query: " . $conn->error];
    }
    $stmt->bind_param("ss", $email, $cpf);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        return ["success" => false, "message" => "E-mail ou CPF já existe."];
    }
    return null;
}

function enviarEmailCadastro($email, $data) {
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'bioverdesistema@gmail.com';
        $mail->Password   = 'gfdx wwpr cnfi emjt';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        $mail->setFrom('bioverdesistema@gmail.com', 'Bio Verde');
        $mail->addAddress($email);

        $mail->isHTML(true);
        $mail->CharSet = 'UTF-8';
        $mail->Subject = 'Bio Verde - Cadastro no Sistema';
        $mail->Body = "
            <html>
            <body style='font-family: Arial, sans-serif; background-color: #e8f5e9; margin: 0; padding: 0;'>
                <div style='max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 15px; overflow: hidden; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);'>
                    <div style='background: linear-gradient(135deg, #2e7d32, #4caf50); padding: 30px; text-align: center;'>
                        <h1 style='color: #ffffff; font-size: 26px; margin: 0;'>Bem-vindo à Bio Verde</h1>
                        <p style='color: #e0f2e9; font-size: 16px; margin: 10px 0 0;'>Seu cadastro foi concluído com sucesso!</p>
                    </div>
                    <div style='padding: 30px; color: #333333;'>
                        <p style='font-size: 18px; line-height: 1.6;'>Olá,</p>
                        <p style='font-size: 18px; line-height: 1.6;'>Agora você faz parte do nosso sistema! Seguem abaixo seus dados de acesso:</p>
                        <div style='background-color: #f1f8e9; padding: 15px; border-radius: 10px; text-align: center; margin: 20px 0;'>
                            <p style='color: #2e7d32; font-size: 18px;'><strong>Email:</strong> ".$data['email']."</p>
                            <p style='color: #2e7d32; font-size: 18px;'><strong>Senha:</strong> ".$data['password']."</p>
                        </div>
                        <p style='font-size: 18px; line-height: 1.6;'>Por questões de segurança, recomendamos que você altere sua senha ao acessar o sistema pela primeira vez.</p>
                        <p style='font-size: 18px; line-height: 1.6;'>Sua senha está protegida por criptografia de ponta a ponta, garantindo total privacidade e segurança.</p>
                        <p style='font-size: 16px; color: #777777; margin-top: 20px;'>Se precisar de ajuda, entre em contato com nosso suporte.</p>
                        <p style='font-size: 16px; color: #777777; margin-top: 20px;'>Atenciosamente,<br>Equipe Bio Verde</p>
                    </div>
                    <div style='background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; color: #777777;'>
                        <p style='margin: 0;'>Este é um e-mail automático. Não é necessário respondê-lo.</p>
                        <p style='margin: 5px 0 0;'>&copy; " . date('Y') . " Bio Verde. Todos os direitos reservados.</p>
                    </div>
                </div>
            </body>
            </html>
        ";
        $mail->AltBody = "Bem-vindo à Bio Verde!\n\nSeu cadastro foi concluído com sucesso.\n\nSeus dados de acesso:\nEmail: ".$data['email']."\nSenha: ".$data['password']."\n\nPor segurança, recomendamos alterar sua senha no primeiro acesso.\n\nAtenciosamente,\nEquipe Bio Verde\n\nEste é um e-mail automático. Não responda.";
        $mail->send();
        return true;
    } catch (Exception $e) {
        return ["success" => false, "message" => "Erro ao enviar e-mail: " . $mail->ErrorInfo];
    }
}

function buscarCargos($conn) {
    $result = $conn->query("SELECT car_id, car_nome FROM cargo");
    if (!$result) {
        throw new Exception("Erro ao buscar cargos: " . $conn->error);
    }

    $cargos = [];
    while ($row = $result->fetch_assoc()) {
        $cargos[] = $row;
    }

    return $cargos;
}

function buscarNiveisAcesso($conn) {
    $result = $conn->query("SELECT nivel_id, nivel_nome FROM niveis_acesso");
    if (!$result) {
        throw new Exception("Erro ao buscar níveis de acesso: " . $conn->error);
    }

    $niveis = [];
    while ($row = $result->fetch_assoc()) {
        $niveis[] = $row;
    }

    return $niveis;
}

function buscarUsuarios($conn) {
    $result = $conn->query("SELECT u.user_id, u.user_nome, u.user_email, u.user_telefone, u.user_CPF, u.car_id, u.nivel_id, u.user_dtcadastro, c.car_nome, n.nivel_nome FROM usuarios u INNER JOIN cargo c ON u.car_id = c.car_id INNER JOIN niveis_acesso n ON u.nivel_id = n.nivel_id");
    if (!$result) {
        throw new Exception("Erro ao buscar usuários: " . $conn->error);
    }

    $usuarios = [];
    while ($row = $result->fetch_assoc()) {
        $usuarios[] = $row;
    }

    return $usuarios;
}
?>

