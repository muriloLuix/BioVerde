<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../../vendor/phpmailer/phpmailer/src/Exception.php';
require '../../vendor/phpmailer/phpmailer/src/PHPMailer.php';
require '../../vendor/phpmailer/phpmailer/src/SMTP.php';
require '../../vendor/autoload.php';

include_once '../ambiente.inc.php';

// Configurações de CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Resposta para requisições OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Verifica a conexão com o banco de dados
if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Erro na conexão com o banco de dados: " . $conn->connect_error]));
}

// Decodifica os dados JSON recebidos
$data = json_decode(file_get_contents("php://input"), true);

// Verifica se o e-mail foi enviado
if (!isset($data["email"])) {
    echo json_encode(["success" => false, "message" => "Campos obrigatórios não informados."]);
    exit();
}

// Escapa o e-mail para prevenir SQL injection
$email = $conn->real_escape_string($data["email"]);

$sql = "SELECT user_email FROM usuarios WHERE user_email = ?";
$res = $conn->prepare($sql);
$res->bind_param("s", $email);
$res->execute();

echo $sql;
exit;

if ($res) {

    if ($res->num_rows > 0) {
        // E-mail encontrado, enviar e-mail de recuperação
        $mail = new PHPMailer(true);

        $res->bind_param("s", $email);
        $res->execute();
        $res->store_result();
    
        // Log para debug
        error_log("E-mails encontrados: " . $res->num_rows);

        try {
            // Configuração do servidor SMTP do Titan Mail
            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = 'contato@goecho.com.br'; // Seu e-mail Titan
            $mail->Password   = ''; // Substitua pela senha correta
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = 587; // Porta para SSL (ou 587 para STARTTLS)

            // Remetente e destinatário
            $mail->setFrom('contato@goecho.com.br', 'Contato teste');
            $mail->addAddress($email);

            // Conteúdo do e-mail
            $mail->isHTML(true);
            $mail->Subject = 'Recuperação de Senha';
            $mail->Body    = 'Seu código de recuperação é: <strong>123456</strong>';
            $mail->AltBody = 'Seu código de recuperação é: 123456';

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
} else {
    echo json_encode(["success" => false, "message" => "Erro ao preparar a consulta SQL."]);
}

$conn->close();
?>
