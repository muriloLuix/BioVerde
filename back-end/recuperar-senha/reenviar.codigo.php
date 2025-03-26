<?php
session_start();

include_once "../cors.php";

// Debug para o console do front-end
echo json_encode(["debug" => "Email na sessão: " . ($_SESSION["email_recuperacao"] ?? "N/A")]);

$email = $_SESSION['email_recuperacao'] ?? null;

if (!$email) {
    echo json_encode(["success" => false, "message" => "Erro: Nenhum e-mail encontrado na sessão."]);
    exit;
}

include_once '../inc/ambiente.inc.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../../vendor/phpmailer/phpmailer/src/Exception.php';
require '../../vendor/phpmailer/phpmailer/src/PHPMailer.php';
require '../../vendor/phpmailer/phpmailer/src/SMTP.php';
require '../../vendor/autoload.php';



if ($conn->connect_error) {
    error_log("Erro na conexão com o banco de dados: " . $conn->connect_error);
    echo json_encode(["success" => false, "message" => "Erro na conexão com o banco de dados."]);
    exit;
}

$rawData = file_get_contents("php://input");
$data = json_decode($rawData, true);

if ($rawData === false || is_null($data)) {
    error_log("Nenhum dado recebido ou JSON inválido.");
    echo json_encode(["success" => false, "message" => "Erro ao processar os dados enviados."]);
    exit;
}


$sql = "SELECT user_email FROM usuarios WHERE user_email = ?";
$res = $conn->prepare($sql);

if (!$res) {
    error_log("Erro na preparação da consulta SQL: " . $conn->error);
    echo json_encode(["success" => false, "message" => "Erro interno no servidor."]);
    exit;
}

$res->bind_param("s", $email);
$res->execute();
$res->store_result();

if ($res->num_rows > 0) {
    $mail = new PHPMailer(true);

    try {
        $alfabeto = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $codigo = '';

        for ($i = 0; $i < 6; $i++) {
            $codigo .= $alfabeto[rand(0, strlen($alfabeto) - 1)];
        }

        $update_sql = "UPDATE usuarios SET codigo_recuperacao = ?, codigo_recuperacao_expira_em = DATE_ADD(NOW(), INTERVAL 30 SECOND) WHERE user_email = ?";
        $update_stmt = $conn->prepare($update_sql);

        if (!$update_stmt) {
            error_log("Erro ao preparar a atualização do código: " . $conn->error);
            echo json_encode(["success" => false, "message" => "Erro interno ao gerar o código de recuperação."]);
            exit;
        }

        $update_stmt->bind_param("ss", $codigo, $email);
        $update_stmt->execute();
        $update_stmt->close();

        // Configuração do PHPMailer
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
        $mail->Subject = 'Bio Verde - Código de Recuperação';
        $mail->Body = "
        <html>
        <body style='font-family: Arial, sans-serif; background-color: #e8f5e9; margin: 0; padding: 0;'>
            <div style='max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 15px; overflow: hidden; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);'>
                <div style='background: linear-gradient(135deg, #2e7d32, #4caf50); padding: 30px; text-align: center;'>
                    <h1 style='color: #ffffff; font-size: 28px; margin: 0;'>Recuperação de Senha</h1>
                    <p style='color: #e0f2e9; font-size: 16px; margin: 10px 0 0;'>Segurança e praticidade para você</p>
                </div>
    
                <div style='padding: 30px; color: #333333;'>
                    <p style='font-size: 18px; line-height: 1.6;'>Olá,</p>
                    <p style='font-size: 18px; line-height: 1.6;'>Seu código de recuperação é:</p>
                    <div style='background-color: #f1f8e9; padding: 15px; border-radius: 10px; text-align: center; margin: 20px 0;'>
                        <strong style='color: #2e7d32; font-size: 24px; letter-spacing: 2px;'>{$codigo}</strong>
                    </div>
                    <p style='font-size: 18px; line-height: 1.6;'>Se você não solicitou essa recuperação, por favor, ignore este e-mail.</p>
                    <p style='font-size: 16px; color: #777777; margin-top: 20px;'>Atenciosamente,<br>Equipe da Bio Verde</p>
                </div>
    
                <div style='background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; color: #777777;'>
                    <p style='margin: 0;'>Este é um e-mail automático, por favor não responda.</p>
                    <p style='margin: 5px 0 0;'>&copy; " . date('Y') . " Bio Verde. Todos os direitos reservados.</p>
                </div>
            </div>
        </body>
        </html>
    ";

        $mail->AltBody = "Seu código de recuperação é: {$codigo}";

        if ($mail->send()) {
            echo json_encode([
                "success" => true, 
                "message" => "E-mail de recuperação reenviado!", 
                "email" => $email,
                "session_id" => session_id()
            ]);
        } else {
            error_log("Erro ao enviar e-mail: " . $mail->ErrorInfo);
            echo json_encode(["success" => false, "message" => "Erro ao enviar e-mail."]);
        }        
    } catch (Exception $e) {
        error_log("PHPMailer Exception: " . $mail->ErrorInfo);
        echo json_encode(["success" => false, "message" => "Erro ao enviar e-mail."]);
    }
} else {
    error_log("E-mail não cadastrado: " . $email);
    echo json_encode(["success" => false, "message" => "E-mail não cadastrado."]);
}

$res->close();
$conn->close();

exit;
?>
