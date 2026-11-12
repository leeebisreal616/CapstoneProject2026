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

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (is_array($data)) {
    $token = trim($data['token'] ?? '');
    $newPassword = $data['password'] ?? $data['new_password'] ?? '';
} else {
    $token = trim($_POST['token'] ?? $_GET['token'] ?? '');
    $newPassword = $_POST['password'] ?? $_POST['new_password'] ?? '';
}

if ($token === '' || $newPassword === '') {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Token and new password are required."]);
    exit();
}

if (strlen($newPassword) < 8) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Password must be at least 8 characters."]);
    exit();
}

$tokenHash = hash('sha256', $token);

$stmt = $conn->prepare("SELECT id, admin_id, expires_at, used_at FROM admin_password_resets WHERE token_hash = ? LIMIT 1");
$stmt->bind_param("s", $tokenHash);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$row) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid or expired reset link. Please request a new one."]);
    exit();
}

if ($row['used_at'] !== null) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "This reset link has already been used. Please request a new one."]);
    exit();
}

if (strtotime($row['expires_at']) < time()) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "This reset link has expired (10 minutes). Please request a new one."]);
    exit();
}

$newHash = password_hash($newPassword, PASSWORD_DEFAULT);
$stmt = $conn->prepare("UPDATE admin_users SET password_hash = ? WHERE admin_id = ?");
$stmt->bind_param("si", $newHash, $row['admin_id']);
$stmt->execute();
$stmt->close();

$stmt = $conn->prepare("UPDATE admin_password_resets SET used_at = NOW() WHERE id = ?");
$stmt->bind_param("i", $row['id']);
$stmt->execute();
$stmt->close();

$stmt = $conn->prepare("DELETE FROM admin_login_attempts WHERE username IN (SELECT username FROM admin_users WHERE admin_id = ?)");
$stmt->bind_param("i", $row['admin_id']);
$stmt->execute();
$stmt->close();

echo json_encode(["success" => true, "message" => "Password reset successful. You can now log in with your new password."]);
?>