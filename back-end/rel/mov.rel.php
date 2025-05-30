<?php
/**************** HEADERS ************************/
session_start();
require_once "../inc/funcoes.inc.php";
$autoloadPath = __DIR__ . '/../../vendor/autoload.php';
if (!file_exists($autoloadPath)) {
    die("Erro: Execute 'composer require mpdf/mpdf' para instalar as dependências");
}
require_once $autoloadPath;
date_default_timezone_set('America/Sao_Paulo');
/*************************************************/

/**************** VERIFICANDO SE A CLASSE DO MPDF EXISTE ************************/
if (!class_exists('\Mpdf\Mpdf')) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Biblioteca mPDF não instalada. Execute: composer require mpdf/mpdf'
    ]);
    exit();
}
/*******************************************************************************/

/**************** VERIFICA AUTENTICAÇÃO ************************/
if (!isset($_SESSION["user_id"])) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Não autorizado']);
    exit();
}
/**************************************************************/

try {
    /**************** BUSCA DADOS DAS MOVIMENTAÇÕES ************************/
    $sql = "SELECT b.produto_nome, d.lote_codigo, mov_quantidade, preco_movimentado, f.localArmazenamento_nome, destino, c.user_nome, a.mov_tipo, e.motivo";
    $sql .= " FROM movimentacoes_estoque a";
    $sql .= " INNER JOIN produtos b ON a.produto_id = b.produto_id";
    $sql .= " INNER JOIN usuarios c ON a.user_id = c.user_id";
    $sql .= " INNER JOIN lote d ON a.lote_id = d.lote_id";
    $sql .= " INNER JOIN motivo_movimentacoes e ON a.motivo_id = e.motivo_id";
    $sql .= " LEFT JOIN locais_armazenamento f ON a.localArmazenamento_id = f.localArmazenamento_id";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $movimentacoes = $stmt->get_result();
    /**************************************************************/

    /**************** CARREGA A LOGO COMO BASE64 ************************/
    $logoFile = __DIR__ . '/../../front-end/public/logo-bioverde-branco.png'; // Caminho para a logo
    if (file_exists($logoFile)) {
        $logoData = base64_encode(file_get_contents($logoFile));
        $logoSrc = 'data:image/png;base64,' . $logoData;
    } else {
        $logoSrc = '';
    }
    /**************************************************************/

    /**************** CRIA O HTML DO RELATÓRIO ************************/
    $html = '
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <title>Relatório de Movimentações do Estoque</title>
        <style>
            body { font-family: Arial, sans-serif; font-size: 12px; color: #333; }
            h1 { color: #2e7d32; text-align: center; font-size: 24px; margin-bottom: 5px; }
            p { text-align: center; margin-top: -5px; font-size: 11px; color: #555; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #2e7d32; color: #fff; font-size: 12px; text-transform: uppercase; padding: 8px; }
            td { padding: 8px; border: 1px solid #ddd; font-size: 11px; }
            tbody tr:nth-child(even) { background-color: #f9f9f9; }
            tbody tr:hover { background-color: #e8f5e9; }
            .footer { margin-top: 30px; font-size: 10px; text-align: center; color: #888; border-top: 1px solid #ccc; padding-top: 5px; }
        </style>
    </head>
    <body>
    
        <h1>Relatório de Movimentações do Estoque</h1>
        <p>Emitido em: ' . date('d/m/Y H:i:s') . '</p>
    
        <table autosize="1">
            <thead>
                <tr>
                    <th style="width: 15%;">Produto</th>
                    <th style="width: 10%;">Código Lote</th>
                    <th style="width: 8%;">Quantidade</th>
                    <th style="width: 12%;">Preço Movimentado</th>
                    <th style="width: 12%;">Local</th>
                    <th style="width: 10%;">Destino</th>
                    <th style="width: 13%;">Responsável</th>
                    <th style="width: 10%;">Tipo</th>
                    <th style="width: 10%;">Motivo</th>
                </tr>
            </thead>
            <tbody>';

    foreach ($movimentacoes as $movimento) {
        $html .= '
        <tr>
            <td>' . htmlspecialchars($movimento['produto_nome']) . '</td>
            <td>' . htmlspecialchars($movimento['lote_codigo']) . '</td>
            <td>' . htmlspecialchars($movimento['mov_quantidade']) . '</td>
            <td>R$ ' . number_format($movimento['preco_movimentado'], 2, ',', '.') . '</td>
            <td>' . htmlspecialchars($movimento['localArmazenamento_nome']) . '</td>
            <td>' . htmlspecialchars($movimento['destino']) . '</td>
            <td>' . htmlspecialchars($movimento['user_nome']) . '</td>
            <td>' . ($movimento['mov_tipo'] === 'saida' ? 'Saída' : ($movimento['mov_tipo'] === 'entrada' ? 'Entrada' : $movimento['mov_tipo'])) . '</td>
            <td>' . htmlspecialchars($movimento['motivo']) . '</td>
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
    /**************************************************************/

    /**************** CONFIGURA O MPDF ************************/
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

    $mpdf->SetTitle('Relatório de Movimentações do Estoque');
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
    header('Content-Disposition: inline; filename="relatorio_movimentacoes.pdf"');
    header('Cache-Control: public, must-revalidate, max-age=0');
    header('Pragma: public');
    header('Expires: Sat, 26 Jul 1997 05:00:00 GMT');
    header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT');

    $mpdf->Output('relatorio_movimentacoes.pdf', 'I');
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
