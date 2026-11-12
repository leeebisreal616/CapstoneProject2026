<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
ini_set('display_errors', 0);
error_reporting(0);
require_once '../db.php';

// [ADD - ARCHIVE] - kung ?archived=1, pakita archived. Kung wala, active lang.
$showArchived = $_GET['archived'] ?? '0';
$archivedFilter = $showArchived === '1' ? 1 : 0;

// [ADD - ARCHIVE] - dinagdag lang archived, archived_at sa SELECT + WHERE
$sql = "SELECT id, appointment_date, consultation_hour, counselor_name, reason, student_info, status, created_at, urgency_level, archived, archived_at FROM appointments WHERE archived=$archivedFilter ORDER BY created_at DESC";
$result = $conn->query($sql);

$data = [];
if ($result) {
  while ($row = $result->fetch_assoc()) {
    $parts = explode(" - ", $row['student_info']);
    $data[] = [
      "id" => $row['id'],
      "student_name" => $parts[0] ?? $row['student_info'],
      "student_id" => $parts[1] ?? '',
      "course" => $parts[2] ?? '',
      "concern" => $row['reason'],
      "appointment_date" => $row['appointment_date'],
      "time_slot" => $row['consultation_hour'],
      "counselor_name" => $row['counselor_name'],
      "status" => ucfirst($row['status']),
      "date_submitted" => $row['created_at'],
      // [ADD - URGENCY] - isang line lang dinagdag sa output
      "urgency_level" => $row['urgency_level'] ?? 'Normal',
      // [ADD - ARCHIVE] - DITO, may comma sa taas kaya ok na
      "archived" => (int)($row['archived'] ?? 0),
      "archived_at" => $row['archived_at'] ?? null,
    ];
  }
}
echo json_encode($data);
$conn->close();