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

// DITO LANG YUNG URL BOSS
$resetBaseUrl = 'http://localhost:5173/admin/reset-password';

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (is_array($data)) {
    $identifier = trim($data['username'] ?? $data['email'] ?? '');
} else {
    $identifier = trim($_POST['username'] ?? $_POST['email'] ?? $_GET['username'] ?? $_GET['email'] ?? '');
}

if ($identifier === '') {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Please enter your username or email."]);
    exit();
}

$stmt = $conn->prepare("SELECT admin_id, username, full_name FROM admin_users WHERE username = ? OR username LIKE ? LIMIT 1");
$like = '%' . $identifier . '%';
$stmt->bind_param("ss", $identifier, $like);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => true, "message" => "If this account exists, a password reset link has been sent to your email."]);
    exit();
}

$admin = $result->fetch_assoc();
$stmt->close();

$notifyEmail = (strpos($admin['username'], '@') !== false) ? $admin['username'] : 'jervin.quicho@cvsu.edu.ph';

// 10 MINS LANG VALID
$token = bin2hex(random_bytes(32));
$tokenHash = hash('sha256', $token);
$expiresAt = date('Y-m-d H:i:s', strtotime('+10 minutes'));

$stmt = $conn->prepare("UPDATE admin_password_resets SET used_at = NOW() WHERE admin_id = ? AND used_at IS NULL");
$stmt->bind_param("i", $admin['admin_id']);
$stmt->execute();
$stmt->close();

$stmt = $conn->prepare("INSERT INTO admin_password_resets (admin_id, token_hash, expires_at) VALUES (?, ?, ?)");
$stmt->bind_param("iss", $admin['admin_id'], $tokenHash, $expiresAt);
$stmt->execute();
$stmt->close();

$resetLink = $resetBaseUrl . '?token=' . $token . '&email=' . urlencode($notifyEmail);
$time = date('M d, Y - h:i A');
$ip = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';

if (function_exists('sendEmail')) {
    sendEmail(
        $notifyEmail,
        "Reset Your GCO Admin Password",
        "
        <div style='font-family: Arial; max-width: 450px; margin: 0 auto; padding: 20px;'>
            <h2 style='color: #085041;'>GCO Admin Portal</h2>
            <p>Hi " . htmlspecialchars($admin['full_name']) . ",</p>
            <p>You requested to reset your password for your GCO Admin account (<b>" . htmlspecialchars($admin['username']) . "</b>).</p>
            <p>Click the button below to reset your password:</p>
            <p style='text-align: center; margin: 24px 0;'>
                <a href='" . htmlspecialchars($resetLink) . "' style='background: #085041; color: #fff; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: bold;'>Reset Password</a>
            </p>
            <p style='color: #666; font-size: 13px;'>This link expires in <b>10 minutes</b>. If you did not request this, please ignore this email.</p>
            <p style='color: #999; font-size: 12px;'>Time: $time<br>IP Address: $ip<br>Guidance and Counseling Office - CvSU Imus Campus</p>
        </div>
        "
    );
}

echo json_encode(["success" => true, "message" => "If this account exists, a password reset link has been sent to your email."]);
?>