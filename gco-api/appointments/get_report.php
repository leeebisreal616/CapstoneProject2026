<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require_once '../db.php';

// By Status
$byStatus = [];
$r = $conn->query("SELECT status, COUNT(*) as count FROM appointments WHERE archived=0 GROUP BY status");
while($row=$r->fetch_assoc()) $byStatus[] = $row;

// By Urgency
$byUrgency = [];
$r = $conn->query("SELECT urgency_level, COUNT(*) as count FROM appointments WHERE archived=0 GROUP BY urgency_level");
while($row=$r->fetch_assoc()) $byUrgency[] = $row;

// By Concern (Reason)
$byConcern = [];
$r = $conn->query("SELECT reason, COUNT(*) as count FROM appointments WHERE archived=0 GROUP BY reason ORDER BY count DESC");
while($row=$r->fetch_assoc()) $byConcern[] = $row;

// By Month (last 6 months) - pang bar graph
$byMonth = [];
$r = $conn->query("SELECT DATE_FORMAT(appointment_date, '%b %Y') as month, COUNT(*) as count FROM appointments WHERE archived=0 GROUP BY DATE_FORMAT(appointment_date, '%Y-%m') ORDER BY appointment_date DESC LIMIT 6");
while($row=$r->fetch_assoc()) $byMonth[] = $row;
$byMonth = array_reverse($byMonth);

// By Counselor
$byCounselor = [];
$r = $conn->query("SELECT counselor_name, COUNT(*) as count FROM appointments WHERE archived=0 GROUP BY counselor_name");
while($row=$r->fetch_assoc()) $byCounselor[] = $row;

$total = $conn->query("SELECT COUNT(*) as c FROM appointments WHERE archived=0")->fetch_assoc()['c'];
$archivedTotal = $conn->query("SELECT COUNT(*) as c FROM appointments WHERE archived=1")->fetch_assoc()['c'];

echo json_encode([
  "total" => (int)$total,
  "archived_total" => (int)$archivedTotal,
  "by_status" => $byStatus,
  "by_urgency" => $byUrgency,
  "by_concern" => $byConcern,
  "by_month" => $byMonth,
  "by_counselor" => $byCounselor
]);
$conn->close();