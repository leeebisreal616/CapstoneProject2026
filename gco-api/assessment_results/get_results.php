<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
ini_set('display_errors',0);
error_reporting(0);
require_once '../db.php';

$student_id = $_GET['student_id'] ?? '';
$hasAllParam = isset($_GET['all']);

// Kung may ?all parameter KAHIT anong value ( ?all , ?all=1 , ?all=true ) => return lahat
// Kung walang student_id at walang all => return lahat din para sa admin
if ($hasAllParam || $student_id === '') {
  $q = $conn->query("SELECT * FROM assessment_results ORDER BY date_taken DESC");
  $data=[];
  while($r=$q->fetch_assoc()) $data[]=$r;
  echo json_encode($data);
  $conn->close();
  exit();
}

// Kung may student_id => pang student view
$stmt = $conn->prepare("SELECT * FROM assessment_results WHERE student_id=? ORDER BY date_taken DESC");
$stmt->bind_param("s",$student_id);
$stmt->execute();
$res=$stmt->get_result();
$data=[];
while($r=$res->fetch_assoc()) $data[]=$r;
echo json_encode($data);
$stmt->close();
$conn->close();