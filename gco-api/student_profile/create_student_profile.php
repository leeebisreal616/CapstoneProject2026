<?php
// create_student_profile.php — POST a new Student Profile Inventory submission
require_once '../db.php';

$data = json_decode(file_get_contents("php://input"), true);

$required = ['student_id', 'nickname', 'place_of_birth', 'religion', 'home_address', 'college_department', 'year_admitted'];
foreach ($required as $field) {
    if (!isset($data[$field]) || $data[$field] === '') {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing required field: $field"]);
        exit();
    }
}

$student_id = $conn->real_escape_string($data['student_id']);
$nickname = $conn->real_escape_string($data['nickname']);
$place_of_birth = $conn->real_escape_string($data['place_of_birth']);
$religion = $conn->real_escape_string($data['religion']);
$home_address = $conn->real_escape_string($data['home_address']);
$college_department = $conn->real_escape_string($data['college_department']);
$year_admitted = (int) $data['year_admitted'];
$scholarship_status = $conn->real_escape_string($data['scholarship_status'] ?? '');
$father_name = $conn->real_escape_string($data['father_name'] ?? '');
$father_occupation = $conn->real_escape_string($data['father_occupation'] ?? '');
$mother_name = $conn->real_escape_string($data['mother_name'] ?? '');
$mother_occupation = $conn->real_escape_string($data['mother_occupation'] ?? '');
$guardian_name = $conn->real_escape_string($data['guardian_name'] ?? '');
$monthly_family_income = $conn->real_escape_string($data['monthly_family_income'] ?? '');
$number_of_siblings = (int) ($data['number_of_siblings'] ?? 0);
$birth_order = $conn->real_escape_string($data['birth_order'] ?? '');
$health_condition = $conn->real_escape_string($data['health_condition'] ?? '');

$stmt = $conn->prepare("INSERT INTO student_profile 
    (student_id, nickname, place_of_birth, religion, home_address, college_department, year_admitted, scholarship_status, father_name, father_occupation, mother_name, mother_occupation, guardian_name, monthly_family_income, number_of_siblings, birth_order, health_condition, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending Review')");

// types: s s s s s s i s s s s s s s i s s  (17 values)
$stmt->bind_param(
    "ssssssisssssssiss",
    $student_id, $nickname, $place_of_birth, $religion, $home_address, $college_department, $year_admitted,
    $scholarship_status, $father_name, $father_occupation, $mother_name, $mother_occupation, $guardian_name,
    $monthly_family_income, $number_of_siblings, $birth_order, $health_condition
);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Student Profile submitted", "submission_id" => $stmt->insert_id]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to save submission: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>