<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/PHPMailer/src/Exception.php';
require_once __DIR__ . '/PHPMailer/src/PHPMailer.php';
require_once __DIR__ . '/PHPMailer/src/SMTP.php';

function sendOtpViaGmail($toEmail, $toName, $otp) {
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        // BAGO: GCO Sender na, hindi na si Aaron
        $mail->Username = 'YOUR_GCO_EMAIL@gmail.com';
        // App Password nung BAGONG GCO email
        $mail->Password = ' ';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;
        $mail->setFrom('YOUR_GCO_EMAIL@gmail.com', 'GCO CvSU Imus');
        $mail->addAddress($toEmail, $toName);
        $mail->isHTML(true);
        $mail->Subject = 'Your GCO Register Code - ' . $otp;
        $mail->Body = "
        <div style='font-family: Arial; max-width: 400px; margin: 0 auto; padding: 20px;'>
            <h2 style='color: #085041;'>GCO Student Portal</h2>
            <p>Hi " . htmlspecialchars($toName) . ",</p>
            <p>Your registration code is:</p>
            <h1 style='font-size: 32px; letter-spacing: 6px; color: #085041; text-align: center; background: #f4f9f7; padding: 16px; border-radius: 12px;'>$otp</h1>
            <p style='color: #666; font-size: 13px;'>This code expires in 5 minutes. Do not share this code.</p>
            <p style='color: #999; font-size: 12px;'>Guidance and Counseling Office - CvSU Imus Campus</p>
        </div>
        ";
        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("PHPMailer Error: " . $mail->ErrorInfo);
        return false;
    }
}

// ============================================================
// Generic email - para sa Admin Lock Alert
// ============================================================
function sendEmail($toEmail, $subject, $htmlBody) {
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'YOUR_GCO_EMAIL@gmail.com';
        // SAME App Password nung bagong GCO email
        $mail->Password = ' ';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;

        $mail->setFrom('YOUR_GCO_EMAIL@gmail.com', 'GCO CvSU Imus');
        $mail->addAddress($toEmail);
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $htmlBody;

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("PHPMailer Error: " . $mail->ErrorInfo);
        return false;
    }
}