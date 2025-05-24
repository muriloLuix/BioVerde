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
    // Busca dados dos produtos
    $sql = "SELECT produto_nome, tproduto_nome, produto_preco, staproduto_nome, fornecedor_nome";
    $sql .= " FROM produtos a";
    $sql .= " INNER JOIN fornecedores b ON a.id_fornecedor = b.fornecedor_id";
    $sql .= " INNER JOIN status_produto c ON a.status_id = c.staproduto_id";
    $sql .= " INNER JOIN tp_produto d ON a.tproduto_id = d.tproduto_id";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $produtos = $stmt->get_result();

    // Cria HTML do relatório
    $html = '
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <title>Relatório de Controle de Estoque</title>
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
    
        <h1>Relatório de Controle de Estoque</h1>
        <p>Emitido em: ' . date('d/m/Y H:i:s') . '</p>
    
        <table autosize="1">
            <thead>
                <tr>
                    <th style="width: 20%;">Nome produto</th>
                    <th style="width: 25%;">Tipo do produto</th>
                    <th style="width: 15%;">Preço</th>
                    <th style="width: 16%;">Status</th>
                    <th style="width: 15%;">Fornecedor</th>
                </tr>
            </thead>
            <tbody>';

    foreach ($produtos as $produto) {
        $html .= '
        <tr>
            <td>' . htmlspecialchars($produto['produto_nome']) . '</td>
            <td>' . htmlspecialchars($produto['tproduto_nome']) . '</td>
            <td>R$ ' . number_format($produto['produto_preco'], 2, ',', '.') . '</td>
            <td>' . htmlspecialchars($produto['staproduto_nome']) . '</td>
            <td>' . htmlspecialchars($produto['fornecedor_nome']) . '</td>
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

    $mpdf->SetTitle('Relatório de Controle do Estoque');
    $mpdf->SetAuthor('Sistema BioVerde');
    $mpdf->SetWatermarkText('BioVerde');
    $mpdf->showWatermarkText = true;
    $mpdf->watermarkTextAlpha = 0.1;

    $mpdf->WriteHTML($html);

    ob_clean();

    header('Content-Type: application/pdf');
    header('Content-Disposition: inline; filename="relatorio_estoque.pdf"');
    header('Cache-Control: public, must-revalidate, max-age=0');
    header('Pragma: public');
    header('Expires: Sat, 26 Jul 1997 05:00:00 GMT');
    header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT');

    $mpdf->Output('relatorio_estoque.pdf', 'I');
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