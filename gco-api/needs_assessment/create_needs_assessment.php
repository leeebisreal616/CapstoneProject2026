<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once '../db.php';
$data = json_decode(file_get_contents("php://input"), true);

$required = ['student_id', 'age', 'sex', 'priority_concern', 'self_rated_wellbeing'];
foreach ($required as $field) {
  if (!isset($data[$field]) || $data[$field] === '') {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing: $field"]);
    exit();
  }
}

$student_id = $data['student_id'];
$age = (int) $data['age'];
$sex = $data['sex'];
$academic_needs = json_encode($data['academic_needs'] ?? []);
$social_needs = json_encode($data['social_needs'] ?? []);
$career_needs = $data['career_needs'] ?? '';
$priority_concern = $data['priority_concern'];
$self_rated_wellbeing = $data['self_rated_wellbeing'];

$stmt = $conn->prepare("INSERT INTO needs_assessment (student_id, age, sex, academic_needs, social_needs, career_needs, priority_concern, self_rated_wellbeing, status, date_submitted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending Review', NOW())");
$stmt->bind_param("sissssss", $student_id, $age, $sex, $academic_needs, $social_needs, $career_needs, $priority_concern, $self_rated_wellbeing);

if ($stmt->execute()) {
  echo json_encode(["success" => true, "submission_id" => $stmt->insert_id]);
} else {
  http_response_code(500);
  echo json_encode(["success" => false, "message" => $stmt->error]);
}
$stmt->close();
$conn->close();