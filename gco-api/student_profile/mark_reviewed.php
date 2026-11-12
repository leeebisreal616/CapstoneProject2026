<?php
// mark_reviewed.php — POST { submission_id } to mark a Student Profile as Reviewed
require_once '../db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['submission_id'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "submission_id is required"]);
    exit();
}

$submission_id = (int) $data['submission_id'];

$stmt = $conn->prepare("UPDATE student_profile SET status = 'Reviewed' WHERE submission_id = ?");
$stmt->bind_param("i", $submission_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Marked as reviewed"]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to update: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>