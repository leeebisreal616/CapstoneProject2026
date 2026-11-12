<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
require_once '../db.php';
$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'] ?? 0;
$action = $data['action'] ?? 'archive'; // archive | restore

if(!$id){ echo json_encode(["success"=>false]); exit(); }

if($action === 'restore'){
  $stmt = $conn->prepare("UPDATE appointments SET archived=0, archived_at=NULL WHERE id=?");
} else {
  $stmt = $conn->prepare("UPDATE appointments SET archived=1, archived_at=NOW() WHERE id=?");
}
$stmt->bind_param("i", $id);
echo json_encode(["success" => $stmt->execute()]);
$stmt->close(); $conn->close();