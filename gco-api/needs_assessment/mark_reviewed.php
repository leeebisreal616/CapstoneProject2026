<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once '../db.php';
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['submission_id'])) {
  http_response_code(400);
  echo json_encode(["success" => false, "message" => "submission_id required"]);
  exit();
}

$submission_id = (int) $data['submission_id'];
$stmt = $conn->prepare("UPDATE needs_assessment SET status = 'Reviewed' WHERE submission_id = ?");
$stmt->bind_param("i", $submission_id);

if ($stmt->execute()) {
  echo json_encode(["success" => true]);
} else {
  http_response_code(500);
  echo json_encode(["success" => false, "message" => $stmt->error]);
}
$stmt->close();
$conn->close();