<?php  
// Chamando o PHPMailer para enviar os e-mails
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
require '../../vendor/phpmailer/phpmailer/src/Exception.php';
require '../../vendor/phpmailer/phpmailer/src/PHPMailer.php';
require '../../vendor/phpmailer/phpmailer/src/SMTP.php';
require '../../vendor/autoload.php';

include_once '../ambiente.inc.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Verificação se a requisição é do tipo OPTIONS (preflight) e responde com sucesso
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Erro na conexão com o banco de dados"]));
}

$data = json_decode(file_get_contents("php://input"), true);

// Buscando o endereço inserido pelo usuário e verificando se está no banco de dados

if (!isset($data["email"])) {
    echo json_encode(["success" => false, "message" => "Campos obrigatórios não informados."]);
    exit();
}

// Previne SQL Injection escapando caracteres especiais no e-mail
$email = $conn->real_escape_string($data["email"]);

$sql = "SELECT usu_email FROM usuario WHERE usu_email = ?";

try {
    //Server settings
    $mail->SMTPDebug = SMTP::DEBUG_SERVER;                      //Enable verbose debug output
    $mail->isSMTP();                                            //Send using SMTP
    $mail->Host       = 'smtp.example.com';                     //Set the SMTP server to send through
    $mail->SMTPAuth   = true;                                   //Enable SMTP authentication
    $mail->Username   = 'user@example.com';                     //SMTP username
    $mail->Password   = 'secret';                               //SMTP password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;            //Enable implicit TLS encryption
    $mail->Port       = 465;                                    //TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`

    //Recipients±
    $mail->setFrom('from@example.com', 'Mailer');
    $mail->addAddress('joe@example.net', 'Joe User');     //Add a recipient
    $mail->addAddress('ellen@example.com');               //Name is optional
    $mail->addReplyTo('info@example.com', 'Information');
    $mail->addCC('cc@example.com');
    $mail->addBCC('bcc@example.com');

    //Attachments
    $mail->addAttachment('/var/tmp/file.tar.gz');         //Add attachments
    $mail->addAttachment('/tmp/image.jpg', 'new.jpg');    //Optional name

    //Content
    $mail->isHTML(true);                                  //Set email format to HTML
    $mail->Subject = 'Here is the subject';
    $mail->Body    = 'This is the HTML message body <b>in bold!</b>';
    $mail->AltBody = 'This is the body in plain text for non-HTML mail clients';

    $mail->send();
    echo 'Message has been sent';
} catch (Exception $e) {
    echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
}

?>