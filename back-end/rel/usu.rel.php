<?php
session_start();

require_once "../inc/funcoes.inc.php";
$autoloadPath = __DIR__ . '/../../vendor/autoload.php';
if (!file_exists($autoloadPath)) {
    die("Erro: Execute 'composer require mpdf/mpdf' para instalar as dependências");
}
require_once $autoloadPath;

if (!class_exists('\Mpdf\Mpdf')) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Biblioteca mPDF não instalada. Execute: composer require mpdf/mpdf'
    ]);
    exit();
}

// Verifica autenticação
if (!isset($_SESSION["user_id"])) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Não autorizado']);
    exit();
}

try {
    // Busca dados dos usuários
    $sql = "SELECT u.user_id, u.user_nome, u.user_email, u.user_CPF,";
    $sql .= " c.car_nome, u.user_dtcadastro FROM usuarios u";
    $sql .= " INNER JOIN cargo c ON u.car_id = c.car_id";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $usuarios = $stmt->get_result();
    
    // Cria HTML do relatório
    $html = '
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Relatório de Usuários</title>
        <style>
            body { font-family: Arial, sans-serif; }
            h1 { color: #2e7d32; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #2e7d32; color: white; padding: 10px; text-align: left; }
            td { padding: 8px; border-bottom: 1px solid #ddd; }
            .header { margin-bottom: 20px; }
            .footer { margin-top: 30px; font-size: 0.8em; text-align: center; color: #666; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Relatório de Usuários</h1>
            <p>Emitido em: '.date('d/m/Y H:i:s').'</p>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>CPF</th>
                    <th>Cargo</th>
                    <th>Data Cadastro</th>
                </tr>
            </thead>
            <tbody>';

    foreach ($usuarios as $usuario) {
        $html .= '
                <tr>
                    <td>'.htmlspecialchars($usuario['user_id']).'</td>
                    <td>'.htmlspecialchars($usuario['user_nome']).'</td>
                    <td>'.htmlspecialchars($usuario['user_email']).'</td>
                    <td>'.htmlspecialchars($usuario['user_CPF']).'</td>
                    <td>'.htmlspecialchars($usuario['car_nome']).'</td>
                    <td>'.(!empty($usuario['user_dtcadastro']) ? date('d/m/Y', strtotime($usuario['user_dtcadastro'])) : '').'</td>
                </tr>';
    }

    $html .= '
            </tbody>
        </table>
        
        <div class="footer">
            <p>Sistema BioVerde - Relatório gerado automaticamente</p>
        </div>
    </body>
    </html>';

    // Configura o mPDF
    $mpdf = new \Mpdf\Mpdf([
        'mode' => 'utf-8',
        'format' => 'A4',
        'default_font' => 'arial',
        'margin_left' => 10,
        'margin_right' => 10,
        'margin_top' => 20,
        'margin_bottom' => 20,
        'margin_header' => 10,
        'margin_footer' => 10,
        'tempDir' => sys_get_temp_dir() 
    ]);
    
    $mpdf->SetTitle('Relatório de Usuários');
    $mpdf->SetAuthor('Sistema BioVerde');
    $mpdf->SetWatermarkText('BioVerde');
    $mpdf->showWatermarkText = true;
    $mpdf->watermarkTextAlpha = 0.1;
    
    $mpdf->WriteHTML($html);
    
    ob_clean();
    
    header('Content-Type: application/pdf');
    header('Content-Disposition: inline; filename="relatorio_usuarios.pdf"');
    header('Cache-Control: public, must-revalidate, max-age=0');
    header('Pragma: public');
    header('Expires: Sat, 26 Jul 1997 05:00:00 GMT');
    header('Last-Modified: '.gmdate('D, d M Y H:i:s').' GMT');
    
    $mpdf->Output('relatorio_usuarios.pdf', 'I');
    exit();

} catch (Exception $e) {
    error_log("Erro ao gerar relatório: " . $e->getMessage());
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao gerar relatório: ' . $e->getMessage()
    ]);
} finally {
    if (isset($conn) && $conn) {
        $conn->close();
    }
}