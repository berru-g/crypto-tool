<?php
// view.php - Pour voir les logs (prot�g� par mot de passe)
session_start();

// Mot de passe pour acc�der aux logs
$admin_pass = "mdp";

if ($_POST['password'] === $admin_pass) {
    $_SESSION['authenticated'] = true;
}

if (!isset($_SESSION['authenticated'])) {
    echo '<form method="POST">
        Password: <input type="password" name="password">
        <input type="submit" value="Login">
    </form>';
    exit;
}

// Affiche les logs
echo "<h2>Logs R�cup�r�s</h2>";
$files = glob('logs/*.txt');
rsort($files);  // Plus r�cents d'abord

foreach ($files as $file) {
    echo "<h3>" . basename($file) . "</h3>";
    echo "<pre>" . htmlspecialchars(file_get_contents($file)) . "</pre>";
    echo "<hr>";
}
?>
