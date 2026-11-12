<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
ini_set('display_errors',0);
require_once '../db.php';

$sql = "SELECT n.*, COALESCE(CONCAT(s.first_name, ' ', s.last_name), n.student_id) AS name, 
        COALESCE(s.course, '') AS course, COALESCE(s.section, '') AS section
        FROM needs_assessment n 
        LEFT JOIN students s ON n.student_id = s.student_id 
        ORDER BY n.date_submitted DESC";

$result = $conn->query($sql);
if (!$result) {
  http_response_code(500);
  echo json_encode(["success"=>false, "message"=>$conn->error]);
  exit();
}

$submissions = [];
while ($row = $result->fetch_assoc()) {
  $row['academic_needs'] = json_decode($row['academic_needs'], true);
  $row['social_needs'] = json_decode($row['social_needs'], true);
  $submissions[] = $row;
}

echo json_encode(["success" => true, "submissions" => $submissions]);
$conn->close();