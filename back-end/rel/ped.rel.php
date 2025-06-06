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
    echo json_encode(['success' => false, 'message' => 'Biblioteca mPDF não instalada.']);
    exit();
}

if (!isset($_SESSION["user_id"])) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Não autorizado']);
    exit();
}

date_default_timezone_set('America/Sao_Paulo');

try {
    $sql = "SELECT p.*, c.cliente_nome 
            FROM pedidos p 
            INNER JOIN clientes c ON c.cliente_id = p.cliente_id";
    $result = $conn->query($sql);
    $pedidos = $result->fetch_all(MYSQLI_ASSOC);

    // Carrega a logo como base64
    $logoFile = __DIR__ . '/../../front-end/public/logo-bioverde-branco.png';
    if (file_exists($logoFile)) {
        $logoData = base64_encode(file_get_contents($logoFile));
        $logoSrc = 'data:image/png;base64,' . $logoData;
    } else {
        $logoSrc = '';
    }

    $html = '
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <title>Relatório de Pedidos</title>
        <style>
            body { font-family: Arial, sans-serif; font-size: 12px; color: #333; }
            h1 { color: #2e7d32; text-align: center; font-size: 24px; margin-bottom: 5px; }
            p { text-align: center; margin-top: -5px; font-size: 11px; color: #555; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background-color: #2e7d32; color: #fff; font-size: 12px; text-transform: uppercase; padding: 8px; }
            td { padding: 8px; border: 1px solid #ddd; font-size: 11px; text-align: center; }
            tbody tr:nth-child(even) { background-color: #f9f9f9; }
            tbody tr:hover { background-color: #e8f5e9; }
            .footer { margin-top: 30px; font-size: 10px; text-align: center; color: #888; border-top: 1px solid #ccc; padding-top: 5px; }
            .pedido-header { background-color: #e0f2f1; padding: 8px; margin-top: 20px; border: 1px solid #2e7d32; font-size: 12px; }
        </style>
    </head>
    <body>
        <h1>Relatório de Pedidos</h1>
        <p>Emitido em: ' . date('d/m/Y H:i:s') . '</p>';

    foreach ($pedidos as $pedido) {
        $html .= '
        <div class="pedido-header">
            <strong>Pedido ID:</strong> ' . $pedido['pedido_id'] . ' |
            <strong>Cliente:</strong> ' . htmlspecialchars($pedido['cliente_nome']) . ' |
            <strong>Data:</strong> ' . date('d/m/Y', strtotime($pedido['pedido_dtCadastro'])) . ' |
            <strong>Valor Total:</strong> R$ ' . number_format($pedido['pedido_valor_total'], 2, ',', '.') . '
        </div>
        <table>
            <thead>
                <tr>
                    <th>Produto</th>
                    <th>Quantidade</th>
                    <th>Unidade</th>
                    <th>Preço</th>
                    <th>Subtotal</th>
                </tr>
            </thead>
            <tbody>';

        $sqlItens = "SELECT i.pedidoitem_quantidade, i.pedidoitem_preco, i.pedidoitem_subtotal,
                            pr.produto_nome, u.uni_sigla
                     FROM pedido_item i
                     INNER JOIN produtos pr ON pr.produto_id = i.produto_id
                     INNER JOIN unidade_medida u ON u.uni_id = i.uni_id
                     WHERE i.pedido_id = ?";
        $stmt = $conn->prepare($sqlItens);
        $stmt->bind_param("i", $pedido['pedido_id']);
        $stmt->execute();
        $itens = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

        foreach ($itens as $item) {
            $html .= '
                <tr>
                    <td>' . htmlspecialchars($item['produto_nome']) . '</td>
                    <td>' . $item['pedidoitem_quantidade'] . '</td>
                    <td>' . $item['uni_sigla'] . '</td>
                    <td>R$ ' . number_format($item['pedidoitem_preco'], 2, ',', '.') . '</td>
                    <td>R$ ' . number_format($item['pedidoitem_subtotal'], 2, ',', '.') . '</td>
                </tr>';
        }

        $html .= '</tbody></table>';
    }

    $html .= '<div class="footer">Sistema BioVerde - Relatório gerado automaticamente</div></body></html>';

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

    $mpdf->SetTitle('Relatório de Pedidos');
    $mpdf->SetAuthor('Sistema BioVerde');

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
    header('Content-Disposition: inline; filename="relatorio_pedidos.pdf"');
    $mpdf->Output('relatorio_pedidos.pdf', 'I');
    exit();

} catch (Exception $e) {
    error_log("Erro ao gerar relatório: " . $e->getMessage());
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Erro ao gerar relatório: ' . $e->getMessage()]);
} finally {
    if (isset($conn) && $conn) {
        $conn->close();
    }
}
