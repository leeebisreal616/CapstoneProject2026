<?php
// get_student_profile.php — GET all Student Profile submissions, joined with student info
require_once '../db.php';

$sql = "SELECT 
            p.submission_id,
            p.student_id,
            CONCAT(s.first_name, ' ', s.last_name) AS name,
            s.course,
            s.section,
            p.nickname,
            p.place_of_birth,
            p.religion,
            p.home_address,
            p.college_department,
            p.year_admitted,
            p.scholarship_status,
            p.father_name,
            p.father_occupation,
            p.mother_name,
            p.mother_occupation,
            p.guardian_name,
            p.monthly_family_income,
            p.number_of_siblings,
            p.birth_order,
            p.health_condition,
            p.status,
            p.date_submitted
        FROM student_profile p
        JOIN students s ON p.student_id = s.student_id
        ORDER BY p.date_submitted DESC";

$result = $conn->query($sql);

$submissions = [];
while ($row = $result->fetch_assoc()) {
    $submissions[] = $row;
}

echo json_encode(["success" => true, "submissions" => $submissions]);

$conn->close();
?>