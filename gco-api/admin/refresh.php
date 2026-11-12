<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once '../db.php';
$data = json_decode(file_get_contents("php://input"), true);
$refreshToken = $data['refresh_token'] ?? '';

if (!$refreshToken) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Refresh token required"]);
    exit();
}

$hash = hash('sha256', $refreshToken);
$stmt = $conn->prepare("SELECT t.admin_id, t.expires_at, a.username, a.full_name, a.role FROM admin_refresh_tokens t JOIN admin_users a ON t.admin_id = a.admin_id WHERE t.token_hash = ?");
$stmt->bind_param("s", $hash);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();

if (!$row || strtotime($row['expires_at']) < time()) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Refresh token expired. Please login again."]);
    exit();
}

// Bigay ng bagong access token
$newAccess = bin2hex(random_bytes(32));
echo json_encode([
    "success" => true,
    "access_token" => $newAccess,
    "expires_in" => 900,
    "admin" => ["admin_id" => $row['admin_id'], "username" => $row['username'], "full_name" => $row['full_name'], "role" => $row['role']]
]);
?>