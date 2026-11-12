<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
  http_response_code(200); 
  exit(); 
}

require_once __DIR__ . '/../db.php';

$raw = file_get_contents("php://input");
$data = json_decode($raw, true) ?? [];

$sid = trim($data['student_id'] ?? $_POST['student_id'] ?? $_GET['student_id'] ?? '');

if ($sid === '') { 
  echo json_encode(["success"=>false, "message"=>"Lagay mo student_id"]); 
  exit(); 
}

$stmt = $conn->prepare("SELECT * FROM students WHERE student_id = ? LIMIT 1");
if (!$stmt) {
  echo json_encode(["success"=>false, "message"=>"DB error: ".$conn->error]);
  exit();
}

$stmt->bind_param("s", $sid);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 0) { 
  echo json_encode(["success"=>false, "message"=>"Student not found: $sid"]); 
  exit(); 
}

$student = $res->fetch_assoc();
// Dagdag full_name para magamit sa React mo na "Aaron Valencia"
$student['full_name'] = trim(($student['first_name'] ?? '') . ' ' . ($student['last_name'] ?? ''));

echo json_encode(["success"=>true, "student"=>$student]);

$stmt->close();
$conn->close();