<?php
// db.php — pure connection only, no headers
$host = "127.0.0.1";
$dbname = "gco_portal";
$username = "root";
$password = "";
mysqli_report(MYSQLI_REPORT_OFF);
$conn = new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) {
  http_response_code(500);
  die(json_encode(["success" => false, "message" => "DB connection failed"]));
}