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

date_default_timezone_set('America/Sao_Paulo');

try {
    // Busca dados dos usuários
    $sql = "SELECT u.user_id, u.user_nome, u.user_email, u.user_CPF, n.nivel_nome, u.user_telefone,";
    $sql .= " c.car_nome, u.user_dtcadastro FROM usuarios u";
    $sql .= " INNER JOIN cargo c ON u.car_id = c.car_id";
    $sql .= " INNER JOIN niveis_acesso n ON u.nivel_id = n.nivel_id";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $usuarios = $stmt->get_result();

    // Carrega a logo como base64
    $logoFile = __DIR__ . '/../../front-end/public/logo-bioverde-branco.png';
    if (file_exists($logoFile)) {
        $logoData = base64_encode(file_get_contents($logoFile));
        $logoSrc = 'data:image/png;base64,' . $logoData;
    } else {
        $logoSrc = '';
    }

    // Cria HTML do relatório
    $html = '
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <title>Relatório de Usuários</title>
        <style>
            body { font-family: Arial, sans-serif; font-size: 12px; color: #333; }
            h1 { color: #2e7d32; text-align: center; font-size: 24px; margin-bottom: 5px; }
            p { text-align: center; margin-top: -5px; font-size: 11px; color: #555; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #2e7d32; color: #fff; font-size: 12px; text-transform: uppercase; padding: 8px; }
            td { padding: 8px; border: 1px solid #ddd; font-size: 11px; text-align: center; }
            tbody tr:nth-child(even) { background-color: #f9f9f9; }
            tbody tr:hover { background-color: #e8f5e9; }
            .footer { margin-top: 30px; font-size: 10px; text-align: center; color: #888; border-top: 1px solid #ccc; padding-top: 5px; }
        </style>
    </head>
    <body>
    
        <h1>Relatório de Usuários</h1>
        <p>Emitido em: ' . date('d/m/Y H:i:s') . '</p>
    
        <table autosize="1">
            <thead>
                <tr>
                    <th style="width: 20%;">Nome</th>
                    <th style="width: 25%;">Email</th>
                    <th style="width: 15%;">CPF</th>
                    <th style="width: 15%;">Telefone</th>
                    <th style="width: 15%;">Cargo</th>
                    <th style="width: 10%;">Nível de Acesso</th>
                </tr>
            </thead>
            <tbody>';

    foreach ($usuarios as $usuario) {
        $html .= '
                <tr>
                    <td>' . htmlspecialchars($usuario['user_nome']) . '</td>
                    <td>' . htmlspecialchars($usuario['user_email']) . '</td>
                    <td>' . htmlspecialchars($usuario['user_CPF']) . '</td>
                    <td>' . htmlspecialchars($usuario['user_telefone']) . '</td>
                    <td>' . htmlspecialchars($usuario['car_nome']) . '</td>
                    <td>' . htmlspecialchars($usuario['nivel_nome']) . '</td>
                </tr>';
    }

    $html .= '
            </tbody>
        </table>
    
        <div class="footer">
            Sistema BioVerde - Relatório gerado automaticamente
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
        'margin_top' => 35,
        'margin_bottom' => 20,
        'margin_header' => 10,
        'margin_footer' => 10,
        'tempDir' => sys_get_temp_dir()
    ]);

    $mpdf->SetTitle('Relatório de Usuários');
    $mpdf->SetAuthor('Sistema BioVerde');

    // Cabeçalho com a logo
    $headerHtml = '
    <div style="text-align: center;">
        <img src="' . $logoSrc . '" width="90" style="margin-top: -15px; opacity: 0.85;">
    </div>
    <hr style="border: 0.5px solid #2e7d32; margin-top: 5px;">
    ';
    $mpdf->SetHTMLHeader($headerHtml);

    $mpdf->WriteHTML($html);

    ob_clean();

    header('Content-Type: application/pdf');
    header('Content-Disposition: inline; filename="relatorio_usuarios.pdf"');
    header('Cache-Control: public, must-revalidate, max-age=0');
    header('Pragma: public');
    header('Expires: Sat, 26 Jul 1997 05:00:00 GMT');
    header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT');

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
