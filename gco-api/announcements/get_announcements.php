<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require_once '../db.php';

// Try with JOIN muna, pag nag-fail (walang admin_users), fallback sa simple SELECT
$sql = "SELECT a.announcement_id as id, a.announcement_id, a.title, a.description, a.content, a.status, a.created_by, adm.full_name AS created_by_name, a.created_at FROM announcements a LEFT JOIN admin_users adm ON a.created_by = adm.admin_id ORDER BY a.created_at DESC";
$result = $conn->query($sql);
if (!$result) {
  $result = $conn->query("SELECT announcement_id as id, announcement_id, title, description, status, created_by, created_at FROM announcements ORDER BY created_at DESC");
}
$list = [];
while ($row = $result->fetch_assoc()) {
  // [FIX] Normalize para kahit anong frontend, maintindihan
  $row['content'] = $row['description'] ?? $row['content'] ?? '';
  $row['status'] = $row['status'] ?? 'Draft';
  // Lowercase version para sa filter ng frontend
  $row['status_lower'] = strtolower($row['status']);
  $list[] = $row;
}
// [FIX] Return BOTH formats: array sa root + announcements key, para kahit anong frontend code mo gumana
echo json_encode($list);
$conn->close();