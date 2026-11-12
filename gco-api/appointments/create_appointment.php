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

$appointment_date = $data['preferred_day'] ?? $data['appointment_date'] ?? '';
$consultation_hour = $data['preferred_time'] ?? $data['consultation_hour'] ?? '';
$counselor_name = $data['counselor_name'] ?? 'Jervin D. Quicho';
$reason = $data['reason'] ?? 'Academic';

// [FIX - URGENCY] - binabasa na yung sinend ni student
$urgency_level = $data['urgency_level'] ?? $data['urgency'] ?? 'Normal';
if (!in_array($urgency_level, ['Normal','Urgent','Emergency'])) $urgency_level = 'Normal';

$student_info = $data['student_info'] ?? null;
$student_id = $data['student_id'] ?? '202311325';
if (!$student_info) {
  $first = $data['first_name'] ?? 'Aaron';
  $last = $data['last_name'] ?? 'Valencia';
  $course = $data['course'] ?? 'BSIT';
  $year = $data['year_level'] ?? '4th Year';
  $student_info = "$first $last - $student_id - $course $year";
}

if ($appointment_date === '' || $consultation_hour === '') {
  http_response_code(400);
  echo json_encode(["success" => false, "message" => "Missing date or time"]);
  exit();
}

// [FIX - URGENCY] - dinagdag urgency_level sa INSERT
$stmt = $conn->prepare("INSERT INTO appointments (appointment_date, consultation_hour, counselor_name, reason, student_info, status, urgency_level) VALUES (?, ?, ?, ?, ?, 'Pending', ?)");
if (!$stmt) {
  http_response_code(500);
  echo json_encode(["success" => false, "message" => $conn->error]);
  exit();
}
// [FIX - URGENCY] - 6 params na ngayon, dati 5 lang
$stmt->bind_param("ssssss", $appointment_date, $consultation_hour, $counselor_name, $reason, $student_info, $urgency_level);

if ($stmt->execute()) {
  echo json_encode(["success" => true, "appointment_id" => $stmt->insert_id, "student_info" => $student_info, "urgency_level" => $urgency_level]);
} else {
  http_response_code(500);
  echo json_encode(["success" => false, "message" => $stmt->error]);
}
$stmt->close();
$conn->close();