<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../db.php';
require_once '../mailer.php';

// FIX: Tinanggal ko yung // dito, kailangan to para mabasa yung JSON
$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (is_array($data)) {
    $username = trim($data['username'] ?? '');
    $password = $data['password'] ?? '';
} else {
    $username = trim($_POST['username'] ?? $_GET['username'] ?? '');
    $password = $_POST['password'] ?? $_GET['password'] ?? '';
}

if ($username === '' || $password === '') {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Username and password required"]);
    exit();
}

// --- 1. CHECK KUNG NAKA-LOCK PA ---
$stmt = $conn->prepare("SELECT attempts, locked_until FROM admin_login_attempts WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$attemptRow = $stmt->get_result()->fetch_assoc();
$stmt->close();

if ($attemptRow && $attemptRow['locked_until'] && strtotime($attemptRow['locked_until']) > time()) {
    $remaining = ceil((strtotime($attemptRow['locked_until']) - time()) / 60);
    http_response_code(429);
    echo json_encode(["success" => false, "message" => "Account locked due to multiple failed attempts. Try again in $remaining minute(s).", "locked" => true, "remaining_minutes" => $remaining]);
    exit();
}

// --- 2. HANAPIN SI ADMIN ---
$stmt = $conn->prepare("SELECT admin_id, username, password_hash, full_name, role FROM admin_users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    recordFailedAttempt($conn, $username);
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Incorrect username or password."]);
    exit();
}

$admin = $result->fetch_assoc();
$stmt->close();

// --- 3. CHECK PASSWORD ---
if (!password_verify($password, $admin['password_hash'])) {
    $attempts = recordFailedAttempt($conn, $username);

    // Pag 3rd fail na, lock + email
    if ($attempts >= 3) {
        $lockUntil = date('Y-m-d H:i:s', strtotime('+30 minutes'));
        $stmt = $conn->prepare("UPDATE admin_login_attempts SET locked_until = ? WHERE username = ?");
        $stmt->bind_param("ss", $lockUntil, $username);
        $stmt->execute();
        $stmt->close();

        // Email notif - kung email yung username (tulad ni leeebisreal616@gmail.com), dun isi-send
        // Kung 'admin' lang, kay Jervin isi-send (sya yung head)
        $notifyEmail = (strpos($username, '@') !== false) ? $username : 'jervin.quicho@cvsu.edu.ph';
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
        $time = date('M d, Y - h:i A');

        if (function_exists('sendEmail')) {
            sendEmail(
                $notifyEmail,
                "Security Alert - GCO Admin Account Locked",
                "Hi {$admin['full_name']},<br><br>Your GCO Admin account (<b>$username</b>) has been locked for 30 minutes due to 3 failed login attempts.<br><br>Time: $time<br>IP Address: $ip<br><br>If this was not you, please contact GCO immediately.<br>If this was you, please wait 30 minutes."
            );
        }

        http_response_code(429);
        echo json_encode(["success" => false, "message" => "Account locked for 30 minutes due to multiple failed attempts. A security alert was sent to your email.", "locked" => true]);
        exit();
    }

    $remaining = 3 - $attempts;
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Incorrect username or password. $remaining attempt(s) remaining."]);
    exit();
}

// --- 4. SUCCESS - RESET ATTEMPTS + GAWA NG TOKENS ---
$stmt = $conn->prepare("DELETE FROM admin_login_attempts WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$stmt->close();

// Access Token - 15 mins lang
$accessToken = bin2hex(random_bytes(32));
// Refresh Token - 7 days
$refreshToken = bin2hex(random_bytes(64));
$refreshHash = hash('sha256', $refreshToken);
$expiresAt = date('Y-m-d H:i:s', strtotime('+7 days'));

$stmt = $conn->prepare("INSERT INTO admin_refresh_tokens (admin_id, token_hash, expires_at) VALUES (?, ?, ?)");
$stmt->bind_param("iss", $admin['admin_id'], $refreshHash, $expiresAt);
$stmt->execute();
$stmt->close();

echo json_encode([
    "success" => true,
    "access_token" => $accessToken,
    "refresh_token" => $refreshToken,
    "expires_in" => 900,
    "admin" => [
        "admin_id" => $admin['admin_id'],
        "username" => $admin['username'],
        "full_name" => $admin['full_name'],
        "role" => $admin['role']
    ]
]);

function recordFailedAttempt($conn, $username) {
    $stmt = $conn->prepare("INSERT INTO admin_login_attempts (username, attempts, last_attempt) VALUES (?, 1, NOW()) ON DUPLICATE KEY UPDATE attempts = attempts + 1, last_attempt = NOW()");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->close();

    $stmt = $conn->prepare("SELECT attempts FROM admin_login_attempts WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    return $row['attempts'] ?? 1;
}
?>