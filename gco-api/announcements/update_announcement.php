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
$title = trim($data['title'] ?? '');
$description = trim($data['description'] ?? $data['content'] ?? $data['message'] ?? '');
if (!$id || $title === '' || $description === '') {
  echo json_encode(["success"=>false,"message"=>"announcement_id, title, and description are required"]); exit;
}
$st = strtolower(trim($data['status'] ?? 'draft'));
$status = ($st === 'published' || $st === 'publish' || $st === 'active') ? 'Published' : 'Draft';

$stmt = $conn->prepare("UPDATE announcements SET title=?, description=?, status=? WHERE announcement_id=?");
$stmt->bind_param("sssi", $title, $description, $status, $id);
if ($stmt->execute()) echo json_encode(["success"=>true,"message"=>"Announcement updated"]);
else echo json_encode(["success"=>false,"message"=>"Failed to update: ".$stmt->error]);
$stmt->close(); $conn->close();