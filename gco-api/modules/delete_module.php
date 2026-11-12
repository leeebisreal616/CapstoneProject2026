<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
require_once '../db.php';
$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'] ?? 0;
$stmt = $conn->prepare("DELETE FROM modules WHERE module_id=?");
$stmt->bind_param("i", $id);
if ($stmt->execute()) echo json_encode(["success"=>true]);
else echo json_encode(["success"=>false,"message"=>$conn->error]);
$conn->close();