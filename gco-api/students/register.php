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
$sid = trim($data['student_id'] ?? $_POST['student_id'] ?? '');
$first = trim($data['first_name'] ?? $_POST['first_name'] ?? '');
$last = trim($data['last_name'] ?? $_POST['last_name'] ?? '');
$mi = trim($data['middle_initial'] ?? $_POST['middle_initial'] ?? '');
$email = trim($data['email'] ?? $_POST['email'] ?? '');
$course = trim($data['course'] ?? $_POST['course'] ?? '');
$year = trim($data['year_level'] ?? $_POST['year_level'] ?? '');

// Middle Initial is OPTIONAL - hindi sya kasama sa required check
if ($sid === '' || $first === '' || $last === '' || $email === '' || $course === '' || $year === '') {
  echo json_encode(["success"=>false, "message"=>"Please fill in all fields."]);
  exit();
}

// CvSU email lang pwede
if (!str_ends_with(strtolower($email), '@cvsu.edu.ph')) {
  echo json_encode(["success"=>false, "message"=>"Please use your CvSU email (@cvsu.edu.ph)."]);
  exit();
}

// Kung may nilagay na MI, 1 letter lang dapat
if ($mi !== '') {
  $mi = strtoupper(substr($mi, 0, 1));
  if (!preg_match('/^[A-Z]$/', $mi)) {
    echo json_encode(["success"=>false, "message"=>"Middle Initial must be 1 letter only."]);
    exit();
  }
} else {
  $mi = null; // Walang MI = NULL sa DB, okay lang
}

// Check kung existing na
$stmt = $conn->prepare("SELECT student_id FROM students WHERE student_id = ? OR email = ? LIMIT 1");
$stmt->bind_param("ss", $sid, $email);
$stmt->execute();
if ($stmt->get_result()->num_rows > 0) {
  echo json_encode(["success"=>false, "message"=>"Student ID or Email already registered. Please login instead."]);
  exit();
}

$stmt2 = $conn->prepare("INSERT INTO students (student_id, first_name, last_name, middle_initial, email, course, year_level, role) VALUES (?, ?, ?, ?, ?, ?, ?, 'student')");
$stmt2->bind_param("sssssss", $sid, $first, $last, $mi, $email, $course, $year);
if ($stmt2->execute()) {
  echo json_encode(["success"=>true, "message"=>"Registered!"]);
} else {
  echo json_encode(["success"=>false, "message"=>"Register failed: ".$conn->error]);
}