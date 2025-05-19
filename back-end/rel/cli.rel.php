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
    // Busca dados dos clientes
    $sql = " SELECT cliente_nome_ou_empresa, cliente_razao_social, cliente_cpf_ou_cnpj, cliente_telefone, cliente_email, ";
    $sql .= " CASE ";
    $sql .= " WHEN cliente_tipo = 'fisica' THEN 'Física' ";
    $sql .= " WHEN cliente_tipo = 'juridica' THEN 'Jurídica' ";
    $sql .= " ELSE cliente_tipo ";
    $sql .= " END as cliente_tipo";
    $sql .= " FROM clientes ";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $clientes = $stmt->get_result();

    // Cria HTML do relatório
    $html = '
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <title>Relatório de Clientes</title>
        <style>
            body { font-family: Arial, sans-serif; font-size: 12px; }
            h1 { color: #2e7d32; text-align: center; font-size: 22px; }
            p { text-align: center; margin-top: -10px; font-size: 12px; color: #555; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
            th { background-color: #2e7d32; color: white; font-size: 13px; }
            tbody tr:nth-child(even) { background-color: #f5f5f5; }
            .footer { margin-top: 30px; font-size: 10px; text-align: center; color: #888; }
        </style>
    </head>
    <body>
    
        <h1>Relatório de Clientes</h1>
        <p>Emitido em: ' . date('d/m/Y H:i:s') . '</p>
    
        <table autosize="1">
            <thead>
                <tr>
                    <th style="width: 20%;">Nome</th>
                    <th style="width: 25%;">Razão Social</th>
                    <th style="width: 15%;">Email</th>
                    <th style="width: 16%;">CPF/CNPJ</th>
                    <th style="width: 15%;">Telefone</th>
                    <th style="width: 15%;">Tipo</th>
                </tr>
            </thead>
            <tbody>';


    foreach ($clientes as $cliente) {
        $html .= '
                    <tr>
                        <td>' . htmlspecialchars($cliente['cliente_nome_ou_empresa']) . '</td>
                        <td>' . htmlspecialchars($cliente['cliente_razao_social']) . '</td>
                        <td>' . htmlspecialchars($cliente['cliente_email']) . '</td>
                        <td>' . htmlspecialchars($cliente['cliente_cpf_ou_cnpj']) . '</td>
                        <td>' . htmlspecialchars($cliente['cliente_telefone']) . '</td>
                        <td>' . htmlspecialchars($cliente['cliente_tipo']) . '</td>
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
        'margin_top' => 20,
        'margin_bottom' => 20,
        'margin_header' => 10,
        'margin_footer' => 10,
        'tempDir' => sys_get_temp_dir()
    ]);

    $mpdf->SetTitle('Relatório de Clientes');
    $mpdf->SetAuthor('Sistema BioVerde');
    $mpdf->SetWatermarkText('BioVerde');
    $mpdf->showWatermarkText = true;
    $mpdf->watermarkTextAlpha = 0.1;

    $mpdf->WriteHTML($html);

    ob_clean();

    header('Content-Type: application/pdf');
    header('Content-Disposition: inline; filename="relatorio_clientes.pdf"');
    header('Cache-Control: public, must-revalidate, max-age=0');
    header('Pragma: public');
    header('Expires: Sat, 26 Jul 1997 05:00:00 GMT');
    header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT');

    $mpdf->Output('relatorio_clientes.pdf', 'I');
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