<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
require_once '../db.php';
$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'] ?? $data['module_id'] ?? 0;
$title = $data['title'] ?? '';
$content = $data['description'] ?? $data['content'] ?? '';
$catIn = strtolower(trim($data['category'] ?? 'academic'));
$status = $data['status'] ?? 'active';
$is_active = ($status === 'archived') ? 0 : 1;

// [FIX] Same translator para sa Edit / Archive
$catMap = [
  'academic' => 'Academic',
  'social' => 'Personal-Social-Emotional',
  'personal-social-emotional' => 'Personal-Social-Emotional',
  'personal-social' => 'Personal-Social-Emotional',
  'career' => 'Career'
];
$category = $catMap[$catIn] ?? 'Academic';

$stmt = $conn->prepare("UPDATE modules SET category=?, title=?, content=?, is_active=? WHERE module_id=?");
$stmt->bind_param("sssii", $category, $title, $content, $is_active, $id);
if ($stmt->execute()) echo json_encode(["success"=>true]);
else echo json_encode(["success"=>false,"message"=>$conn->error]);
$conn->close();