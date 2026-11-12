<?php
date_default_timezone_set('Asia/Manila');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit();
}

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../mailer.php'; // <-- DINAGDAG KO TO

// *** LAGAY MO DITO YUNG BAGONG API KEY MO - WAG MO I-SEND DITO ***
$RESEND_API_KEY = 're_CWA1QxCc_53u14ZCSFmSMfnBLPxRGe3d';

$raw = file_get_contents("php://input");
$data = json_decode($raw, true) ?? [];
$sid = trim($data['student_id'] ?? $_POST['student_id'] ?? $_GET['student_id'] ?? '');

if ($sid === '') {
  echo json_encode(["success"=>false, "message"=>"Lagay mo student_id"]);
  exit();
}

$stmt = $conn->prepare("SELECT student_id, email, first_name, last_name FROM students WHERE student_id = ? LIMIT 1");
if (!$stmt) {
  echo json_encode(["success"=>false, "message"=>"DB error: ".$conn->error]);
  exit();
}
$stmt->bind_param("s", $sid);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 0) {
  echo json_encode(["success"=>false, "message"=>"Student not found: $sid"]);
  exit();
}

$student = $res->fetch_assoc();
$email = $student['email'];
$full_name = trim(($student['first_name'] ?? '') . ' ' . ($student['last_name'] ?? ''));

if (!$email) {
  echo json_encode(["success"=>false, "message"=>"No email found for this student. Please contact GCO."]);
  exit();
}

$otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
$expires_at = date('Y-m-d H:i:s', strtotime('+5 minutes'));

$conn->query("DELETE FROM otp_codes WHERE student_id = '" . $conn->real_escape_string($sid) . "'");

$stmt2 = $conn->prepare("INSERT INTO otp_codes (student_id, email, otp_code, expires_at) VALUES (?, ?, ?, ?)");
$stmt2->bind_param("ssss", $sid, $email, $otp, $expires_at);
$stmt2->execute();

$html_body = "
  <div style='font-family: Arial; max-width: 400px; margin: 0 auto; padding: 20px;'>
    <h2 style='color: #085041;'>GCO Student Portal</h2>
    <p>Hi " . htmlspecialchars($full_name) . ",</p>
    <p>Your login code is:</p>
    <h1 style='font-size: 32px; letter-spacing: 6px; color: #085041; text-align: center; background: #f4f9f7; padding: 16px; border-radius: 12px;'>$otp</h1>
    <p style='color: #666; font-size: 13px;'>This code expires in 5 minutes. Do not share this code.</p>
    <p style='color: #999; font-size: 12px;'>Guidance and Counseling Office - CvSU Imus Campus</p>
  </div>
";

// --- STEP 1: TRY RESEND MUNA ---
$payload = json_encode([
  'from' => 'GCO Portal <onboarding@resend.dev>',
  'to' => [$email],
  'subject' => 'Your GCO Login Code - ' . $otp,
  'html' => $html_body
]);

$ch = curl_init('https://api.resend.com/emails');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  'Authorization: Bearer ' . $RESEND_API_KEY,
  'Content-Type: application/json'
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$sent = ($httpCode >= 200 && $httpCode < 300);
$method = 'resend';

// --- STEP 2: PAG NAG-FAIL SI RESEND, LIPAT SA PHPMAILER / GMAIL ---
if (!$sent) {
  error_log("Resend failed for $email: " . $response . " - Trying Gmail fallback");
  $sent = sendOtpViaGmail($email, $full_name, $otp);
  if ($sent) {
    $method = 'gmail';
  }
}

if ($sent) {
  $masked = substr($email, 0, 2) . '***' . substr($email, strpos($email, '@'));
  echo json_encode(["success"=>true, "message"=>"Code sent to " . $masked . " via " . $method]);
} else {
  echo json_encode(["success"=>false, "message"=>"Failed to send email. Both Resend and Gmail failed."]);
}

$stmt->close();
$conn->close();