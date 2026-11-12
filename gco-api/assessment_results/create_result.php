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

$student_id = $data['student_id'] ?? '202311325';
$exam_type_raw = $data['exam_type'] ?? $data['assessment_type'] ?? '';
$score = intval($data['score'] ?? 0);
$result_label = $data['result_label'] ?? '';
$flag_level = $data['flag_level'] ?? 'Normal';

// Normalize exam_type to match your DB: Personality, Well-Being
$exam_type = 'Well-Being';
if (stripos($exam_type_raw, 'personal') !== false) $exam_type = 'Personality';
if (stripos($exam_type_raw, 'well') !== false) $exam_type = 'Well-Being';
if ($exam_type_raw === 'personality') $exam_type = 'Personality';
if ($exam_type_raw === 'wellbeing') $exam_type = 'Well-Being';

if (!$exam_type) {
  http_response_code(400);
  echo json_encode(["success"=>false,"message"=>"exam_type required"]);
  exit();
}

// Upsert - pag nag retake, update lang hindi duplicate
$check = $conn->prepare("SELECT result_id FROM assessment_results WHERE student_id = ? AND exam_type = ?");
$check->bind_param("ss", $student_id, $exam_type);
$check->execute();
$res = $check->get_result();

if ($res->num_rows > 0) {
  $stmt = $conn->prepare("UPDATE assessment_results SET score=?, result_label=?, flag_level=?, date_taken=NOW() WHERE student_id=? AND exam_type=?");
  $stmt->bind_param("issss", $score, $result_label, $flag_level, $student_id, $exam_type);
} else {
  $stmt = $conn->prepare("INSERT INTO assessment_results (student_id, exam_type, score, result_label, flag_level, date_taken) VALUES (?, ?, ?, ?, ?, NOW())");
  $stmt->bind_param("ssiss", $student_id, $exam_type, $score, $result_label, $flag_level);
}
$check->close();

if ($stmt->execute()) {
  echo json_encode(["success"=>true, "student_id"=>$student_id, "exam_type"=>$exam_type]);
} else {
  http_response_code(500);
  echo json_encode(["success"=>false,"message"=>$stmt->error]);
}
$stmt->close();
$conn->close();