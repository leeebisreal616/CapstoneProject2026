<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require_once '../db.php';
$r = $conn->query("SELECT module_id as id, category, title, content, is_active, created_at FROM modules ORDER BY created_at DESC");
$list = [];
while($row=$r->fetch_assoc()){
  $row['description'] = $row['content'];
  $row['status'] = $row['is_active'] == 1 ? 'active' : 'archived';
  // [FIX] Translator pabalik: pangalan sa DB -> code sa frontend
  $c = strtolower(trim($row['category'] ?? ''));
  if (strpos($c,'social')!==false || strpos($c,'personal')!==false) $row['category']='social';
  else if (strpos($c,'career')!==false) $row['category']='career';
  else $row['category']='academic';
  $list[] = $row;
}
echo json_encode($list);
$conn->close();