<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;
require_once '../db.php';
$data = json_decode(file_get_contents("php://input"), true);

// [FIX] Tanggapin pareho: id at announcement_id
$id = (int)($data['announcement_id'] ?? $data['id'] ?? 0);
if (!$id) {
  echo json_encode(["success"=>false,"message"=>"No id provided"]);
  exit;
}

$stmt = $conn->prepare("DELETE FROM announcements WHERE announcement_id = ?");
$stmt->bind_param("i", $id);
if ($stmt->execute()) {
  echo json_encode(["success"=>true,"message"=>"Deleted"]);
} else {
  echo json_encode(["success"=>false,"message"=>"Delete failed: ".$stmt->error]);
}
$stmt->close(); $conn->close();