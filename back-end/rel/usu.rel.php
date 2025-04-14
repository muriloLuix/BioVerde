<?php
ini_set("display_errors", 1);

// Configurações de codificação
header('Content-Type: text/html; charset=utf-8');
mb_internal_encoding('UTF-8');

session_start();

require_once "../inc/funcoes.inc.php";
require_once '../../vendor/autoload.php';
require_once '../../vendor/tecnickcom/tcpdf/tcpdf.php';

// Verifica autenticação
if (!isset($_SESSION["user_id"])) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Não autorizado']);
    exit();
}

class PDF extends TCPDF
{
    function Header()
    {
        $this->SetFont('helvetica', 'B', 14);
        $this->SetTextColor(46, 125, 50);
        $this->Cell(0, 10, 'Relatório de Usuários', 0, 1, 'C');

        $this->SetFont('helvetica', '', 10);
        $this->SetTextColor(0);
        $this->Cell(0, 10, 'Emitido em: ' . date('d/m/Y H:i:s'), 0, 1, 'C');
        $this->Ln(5);

        $this->SetFillColor(46, 125, 50);
        $this->SetTextColor(255);
        $this->SetFont('helvetica', 'B', 10);

        $this->Cell(15, 8, 'ID', 1, 0, 'C', true);
        $this->Cell(50, 8, 'Nome', 1, 0, 'L', true);
        $this->Cell(60, 8, 'Email', 1, 0, 'L', true);
        $this->Cell(30, 8, 'CPF', 1, 0, 'C', true);
        $this->Cell(40, 8, 'Cargo', 1, 0, 'L', true);
        $this->Cell(30, 8, 'Dt Cadastro', 1, 1, 'C', true);
    }

    function Footer()
    {
        $this->SetY(-15);
        $this->SetFont('helvetica', 'I', 8);
        $this->SetTextColor(100);
        $this->Cell(0, 10, 'Sistema BioVerde - Relatório gerado automaticamente', 0, 0, 'C');
    }

    // Método para truncar texto dentro da classe
    function truncateText($text, $length)
    {
        if (strlen($text) > $length) {
            return substr($text, 0, $length) . '...';
        }
        return $text;
    }
}

try {
    // Busca dados dos usuários
    $usuarios = buscarUsuarios($conn);

    // Cria PDF
    $pdf = new PDF('P', 'mm', 'A4', true, 'UTF-8', false);

    $pdf->SetCreator('Sistema BioVerde');
    $pdf->SetAuthor('Sistema BioVerde');
    $pdf->SetTitle('Relatório de Usuários');
    $pdf->SetSubject('Relatório de Usuários');
    $pdf->SetMargins(15, 25, 15);

    $pdf->AddPage();
    $pdf->SetFont('helvetica', '', 10);
    $pdf->SetTextColor(0);

    foreach ($usuarios as $usuario) {
        $cpf = preg_replace('/(\d{3})(\d{3})(\d{3})(\d{2})/', '$1.$2.$3-$4', $usuario['user_CPF']);

        $pdf->Cell(15, 8, $usuario['user_id'], 1, 0, 'C');
        $pdf->Cell(50, 8, $pdf->truncateText($usuario['user_nome'], 30), 1, 0, 'L');
        $pdf->Cell(60, 8, $pdf->truncateText($usuario['user_email'], 35), 1, 0, 'L');
        $pdf->Cell(30, 8, $cpf, 1, 0, 'C');
        $pdf->Cell(40, 8, $pdf->truncateText($usuario['car_nome'], 25), 1, 0, 'L');

        $dataCadastro = !empty($usuario['user_dtcadastro']) ? date('d/m/Y', strtotime($usuario['user_dtcadastro'])) : '';
        $pdf->Cell(30, 8, $dataCadastro, 1, 1, 'C');
    }

    ob_clean(); // Limpa qualquer saída anterior

    $pdf->Output('relatorio_usuarios.pdf', 'I');

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
?>
