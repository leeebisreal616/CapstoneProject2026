<?php
date_default_timezone_set('Asia/Manila');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../db.php';

$raw = file_get_contents("php://input");
$data = json_decode($raw, true) ?? [];
$sid = trim($data['student_id'] ?? $_POST['student_id'] ?? $_GET['student_id'] ?? '');
$otp = trim($data['otp'] ?? $_POST['otp'] ?? $_GET['otp'] ?? '');

if ($sid === '' || $otp === '') {
  echo json_encode(["success"=>false, "message"=>"Student ID and code are required."]);
  exit();
}

$stmt = $conn->prepare("SELECT * FROM otp_codes WHERE student_id = ? AND otp_code = ? AND is_used = 0 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1");
if (!$stmt) { echo json_encode(["success"=>false, "message"=>"DB error: ".$conn->error]); exit(); }
$stmt->bind_param("ss", $sid, $otp);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 0) {
  echo json_encode(["success"=>false, "message"=>"Invalid or expired code. Please request a new one."]);
  exit();
}

$otpRow = $res->fetch_assoc();
$conn->query("UPDATE otp_codes SET is_used = 1 WHERE id = " . intval($otpRow['id']));

$stmt2 = $conn->prepare("SELECT * FROM students WHERE student_id = ? LIMIT 1");
$stmt2->bind_param("s", $sid);
$stmt2->execute();
$student = $stmt2->get_result()->fetch_assoc();
$student['full_name'] = trim(($student['first_name'] ?? '') . ' ' . ($student['last_name'] ?? ''));

echo json_encode(["success"=>true, "student"=>$student]);

$stmt->close();
$stmt2->close();
$conn->close();