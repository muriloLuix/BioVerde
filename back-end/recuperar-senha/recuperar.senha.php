<?php
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 0); // Mude para 1 se estiver usando HTTPS
ini_set('session.cookie_samesite', 'Lax'); // Ou 'Strict' para mais segurança
ini_set('session.use_strict_mode', 1);
ini_set('session.cookie_lifetime', 600); // 10 minutos

session_start();
header_remove('X-Powered-By');
header('Content-Type: application/json; charset=UTF-8');
include_once '../inc/ambiente.inc.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../../vendor/phpmailer/phpmailer/src/Exception.php';
require '../../vendor/phpmailer/phpmailer/src/PHPMailer.php';
require '../../vendor/phpmailer/phpmailer/src/SMTP.php';
require '../../vendor/autoload.php';

include_once "../cors.php";

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Erro na conexão com o banco de dados: " . $conn->connect_error]));
}

$rawData = file_get_contents("php://input");

if (empty($rawData)) {
    echo json_encode(["success" => false, "message" => "Nenhum dado recebido."]);
    exit;
}

$data = json_decode($rawData, true);

if (empty($data) || !isset($data["email"])) {
    echo json_encode(["success" => false, "message" => "E-mail não informado ou erro ao decodificar JSON"]);
    exit;
}

$email = $conn->real_escape_string($data["email"]);

// $_SESSION["email_recuperacao"] = $email;

// var_dump($_SESSION);
// exit;

// // Armazena o e-mail em um cookie válido por 10 minutos
// setcookie("email_recuperacao", $email, time() + 600, "/", "", false, true);

$sql = "SELECT user_email FROM usuarios WHERE user_email = ?";
$res = $conn->prepare($sql);
$res->bind_param("s", $email);
$res->execute();
$res->store_result();


if ($res->num_rows > 0) {

    // Armazena o email na sessão
    $_SESSION['email_recuperacao'] = $email;
    // Define o tempo de expiração da sessão (10 minutos)
    $_SESSION['expire_time'] = time() + 600;
        
    $mail = new PHPMailer(true);

    try {
        $alfabeto = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $codigo = '';

        for ($i = 0; $i < 6; $i++) {
            $codigo .= $alfabeto[rand(0, strlen($alfabeto) - 1)];
        }

        // Salvar o código no banco de dados
        $update_sql = "UPDATE usuarios SET codigo_recuperacao = ? WHERE user_email = ?";
        $update_stmt = $conn->prepare($update_sql);
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

        $mail->send();
        
        echo json_encode([
            "success" => true, 
            "message" => "Código enviado para seu e-mail!", 
            "email" => $email,
            "session_id" => session_id()
        ]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Erro ao enviar e-mail: " . $mail->ErrorInfo]);
    }
} else {
    echo json_encode(["success" => false, "message" => "E-mail não cadastrado."]);
}

$res->close();
$conn->close();