<?php
session_start();

header('Content-Type: application/json');

require_once '../inc/funcoes.inc.php'; 

if (!isset($_SESSION["user_id"])) {
    checkLoggedUser($conn, $_SESSION['user_id']);;
}
echo json_encode([
    'loggedIn' => true,
    'user_id' => $_SESSION['user_id']
]);
