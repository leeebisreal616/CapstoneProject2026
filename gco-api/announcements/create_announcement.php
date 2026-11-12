<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;
require_once '../db.php';
$data = json_decode(file_get_contents("php://input"), true);

$title = trim($data['title'] ?? '');
$description = trim($data['description'] ?? $data['content'] ?? $data['message'] ?? '');
if ($title === '' || $description === '') {
  echo json_encode(["success"=>false,"message"=>"Title and description are required"]); exit;
}

// [FIX] Case-insensitive: published / Published / publish / active -> Published, lahat else Draft
$st = strtolower(trim($data['status'] ?? 'draft'));
$status = ($st === 'published' || $st === 'publish' || $st === 'active') ? 'Published' : 'Draft';

// [FIX] created_by: kung walang sinend, wag isama sa INSERT para hindi mag-FK error
$created_by = isset($data['created_by']) ? (int)$data['created_by'] : null;

if ($created_by) {
  $stmt = $conn->prepare("INSERT INTO announcements (title, description, status, created_by) VALUES (?, ?, ?, ?)");
  $stmt->bind_param("sssi", $title, $description, $status, $created_by);
} else {
  $stmt = $conn->prepare("INSERT INTO announcements (title, description, status) VALUES (?, ?, ?)");
  $stmt->bind_param("sss", $title, $description, $status);
}

if ($stmt->execute()) echo json_encode(["success"=>true,"message"=>"Announcement created","announcement_id"=>$stmt->insert_id,"id"=>$stmt->insert_id]);
else echo json_encode(["success"=>false,"message"=>"Failed to create: ".$stmt->error]);
$stmt->close(); $conn->close();