<?php

header('Content-Type: application/json');

include_once '../inc/ambiente.inc.php';

// PHPMAiler
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
require '../../vendor/phpmailer/phpmailer/src/Exception.php';
require '../../vendor/phpmailer/phpmailer/src/PHPMailer.php';
require '../../vendor/phpmailer/phpmailer/src/SMTP.php';
require '../../vendor/autoload.php';

// Cors e verificação
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Verificando se deu algum erro no banco de dados
if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Erro na conexão com o banco de dados: " . $conn->connect_error]));
}

// Pegando os dados e decodificando JSON
$rawData = file_get_contents("php://input");
error_log("Raw data: " . $rawData); 

if (empty($rawData)) {
    echo json_encode(["success" => false, "message" => "Nenhum dado recebido."]);
    exit;
}

$data = json_decode($rawData, true);
error_log("Decoded data: " . print_r($data, true)); 

if (empty($data)) {
    echo json_encode(["success" => false, "message" => "Erro ao decodificar JSON"]);
    exit;
}

// Verificando se existe o e-mail
if (!isset($data["email"])) {
    echo json_encode(["success" => false, "message" => "Campo 'email' não informado."]);
    exit;
}

$email = $conn->real_escape_string($data["email"]);
error_log("Email a ser verificado: " . $email);

var_dump($data);
var_dump($email);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(["success" => false, "message" => "Erro ao decodificar JSON: " . json_last_error_msg()]);
    exit;
}

$sql = "SELECT user_email FROM usuarios WHERE user_email = ?;";
$res = $conn->prepare($sql);
$res->bind_param("s", $email);
$res->execute();
$res->store_result();

error_log("Número de linhas retornadas: " . $res->num_rows);

if ($res->num_rows > 0) {

    $mail = new PHPMailer(true);

    // Log para debug
    // error_log("E-mail encontrado, iniciando envio de e-mail.");

    try {
        // Configuração do servidor SMTP do Gmail
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'bioverdesistema@gmail.com';
        $mail->Password   = 'gfdx wwpr cnfi emjt';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        // Remetente e destinatário
        $mail->setFrom('bioverdesistema@gmail.com', 'Bio Verde');
        $mail->addAddress($email);

        // Conteúdo do e-mail
        $mail->isHTML(true);
        $mail->Subject = utf8_decode('Bio Verde - Recuperação de Senha');
        $mail->Body    = utf8_decode('
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; }
                    .container { width: 80%; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9; }
                    .header { background-color: #4CAF50; color: white; padding: 10px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { padding: 20px; }
                    .code { font-size: 20px; color: #4CAF50; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>Bio Verde</h2>
                    </div>
                    <div class="content">
                        <p>Olá,</p>
                        <p>Recebemos uma solicitação para redefinir sua senha. Por favor, use o código abaixo para continuar:</p>
                        <p class="code"><strong>123456</strong></p>
                        <p>Se você não solicitou a recuperação da senha, por favor ignore este e-mail.</p>
                        <p>Atenciosamente,<br>Equipe Bio Verde</p>
                    </div>
                </div>
            </body>
            </html>
        ');
        $mail->AltBody = utf8_decode('Seu código de recuperação é: 123456');

        // Envia o e-mail
        $mail->send();
        echo json_encode(["success" => true, "message" => "Código enviado para seu e-mail!"]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Erro ao enviar e-mail: " . $mail->ErrorInfo]);
    }
} else {
    echo json_encode(["success" => false, "message" => "E-mail não cadastrado."]);
}

$res->close();
$conn->close();
?>