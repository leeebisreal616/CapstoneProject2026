<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

ini_set('display_errors', 0);
error_reporting(0);
require_once '../db.php';

$data = json_decode(file_get_contents("php://input"), true);

$appointment_id = $data['id'] ?? $data['appointment_id'] ?? 0;
$status = $data['status'] ?? '';

if (!$appointment_id || !$status) {
  http_response_code(400);
  echo json_encode(["success"=>false,"message"=>"id and status required"]);
  exit();
}

$allowed = ['Pending','Approved','Declined','Completed','Cancelled'];
if (!in_array($status, $allowed)) $status = 'Approved';

$stmt = $conn->prepare("UPDATE appointments SET status = ? WHERE id = ?");
$stmt->bind_param("si", $status, $appointment_id);

if ($stmt->execute()) {
  echo json_encode(["success"=>true,"message"=>"Updated to $status"]);
} else {
  http_response_code(500);
  echo json_encode(["success"=>false,"message"=>$stmt->error]);
}
$stmt->close();
$conn->close();