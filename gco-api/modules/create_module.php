<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
require_once '../db.php';
$data = json_decode(file_get_contents("php://input"), true);
$title = $data['title'] ?? '';
$content = $data['description'] ?? $data['content'] ?? '';
$catIn = strtolower(trim($data['category'] ?? 'academic'));
$status = $data['status'] ?? 'active';
$is_active = ($status === 'archived') ? 0 : 1;

// [FIX] Translator: code galing frontend -> pangalan na kilala ng ENUM sa DB
$catMap = [
  'academic' => 'Academic',
  'social' => 'Personal-Social-Emotional',
  'personal-social-emotional' => 'Personal-Social-Emotional',
  'personal-social' => 'Personal-Social-Emotional',
  'career' => 'Career'
];
$category = $catMap[$catIn] ?? 'Academic';

if (!$title) { echo json_encode(["success"=>false,"message"=>"Title required"]); exit; }
$stmt = $conn->prepare("INSERT INTO modules (category, title, content, is_active) VALUES (?, ?, ?, ?)");
$stmt->bind_param("sssi", $category, $title, $content, $is_active);
if ($stmt->execute()) echo json_encode(["success"=>true,"id"=>$conn->insert_id]);
else echo json_encode(["success"=>false,"message"=>$conn->error]);
$conn->close();