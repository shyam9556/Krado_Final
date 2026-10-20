<?php
/**
 * ============================================================================
 * Krado — Contact Form Handler (SMTP via Gmail)
 * ============================================================================
 *
 * Industry-standard PHP mail handler for the "Start a Project" form.
 *
 * Security features:
 *   - Input sanitization & validation
 *   - Honeypot field (bot trap)
 *   - File-based rate limiting (max 5 submissions per IP per hour)
 *   - CORS origin validation
 *   - SMTP with TLS (Gmail) — reliable delivery, won't go to spam
 *   - Request method validation (POST only)
 *
 * @version  2.0.0 (SMTP)
 */

// ─── CONFIGURATION ──────────────────────────────────────────────────────────

define('MAIL_TO',       'sakhiyashyam99@gmail.com, dakshborada@gmail.com, info@kradotech.com');
define('MAIL_FROM',     'info@kradotech.com');
define('MAIL_FROM_NAME','Krado Website');
define('SITE_NAME',     'Krado');

// cPanel SMTP — port 465 SMTPS (SSL). Uses your own server's mail, always open.
define('SMTP_HOST', 'smtps://mail.kradotech.com');
define('SMTP_PORT', 465);
define('SMTP_USER', 'info@kradotech.com');
define('SMTP_PASS', 'YOUR_CPANEL_EMAIL_PASSWORD'); // ← Replace with cPanel password for info@kradotech.com

// Allowed origins
define('ALLOWED_ORIGINS', [
    'https://krado.co',
    'https://www.krado.co',
    'http://localhost',
    'http://localhost:80',
]);

// Rate limiting
define('RATE_LIMIT_MAX',    5);
define('RATE_LIMIT_WINDOW', 3600);
define('RATE_LIMIT_DIR',    __DIR__ . '/_rate_limits');

// ─── SMTP MAILER ─────────────────────────────────────────────────────────────

/**
 * Send an email via Gmail SMTP with STARTTLS.
 * Pure PHP — no external libraries required.
 *
 * @throws RuntimeException on SMTP communication failure
 */
function smtp_send(string $to, string $subject, string $htmlBody, string $replyToEmail = '', string $replyToName = ''): void {

    $fromEmail  = SMTP_USER;
    $fromName   = MAIL_FROM_NAME;
    $recipients = array_map('trim', explode(',', $to));
    $toHeader   = implode(', ', $recipients);

    // Build RFC 2822 email message
    $date    = date('r');
    $msgId   = '<' . uniqid('krado', true) . '@krado.co>';

    $message  = "Date: {$date}\r\n";
    $message .= "Message-ID: {$msgId}\r\n";
    $message .= "From: =?UTF-8?B?" . base64_encode($fromName) . "?= <{$fromEmail}>\r\n";
    $message .= "To: {$toHeader}\r\n";

    // Reply-To: when you hit "Reply" on the email, it goes to the person who submitted the form
    if ($replyToEmail) {
        $replyToLabel = $replyToName ? "=?UTF-8?B?" . base64_encode($replyToName) . "?= <{$replyToEmail}>" : $replyToEmail;
        $message .= "Reply-To: {$replyToLabel}\r\n";
    }

    $message .= "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=\r\n";
    $message .= "MIME-Version: 1.0\r\n";
    $message .= "Content-Type: text/html; charset=UTF-8\r\n";
    $message .= "Content-Transfer-Encoding: base64\r\n";
    $message .= "X-Mailer: Krado-Contact/2.0\r\n";
    $message .= "X-Priority: 1\r\n";
    $message .= "Importance: High\r\n";
    $message .= "\r\n";
    $message .= chunk_split(base64_encode($htmlBody));

    // Use php://temp (memory/disk) instead of data:// — handles large emails reliably
    $stream = fopen('php://temp', 'r+');
    fwrite($stream, $message);
    rewind($stream);

    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL            => SMTP_HOST . ':' . SMTP_PORT,
        CURLOPT_USERPWD        => SMTP_USER . ':' . SMTP_PASS,
        CURLOPT_MAIL_FROM      => "<{$fromEmail}>",
        CURLOPT_MAIL_RCPT      => array_map(fn($r) => "<{$r}>", $recipients),
        CURLOPT_READDATA       => $stream,
        CURLOPT_INFILESIZE     => strlen($message),  // Tell cURL exact size
        CURLOPT_UPLOAD         => true,        // SMTP DATA mode
        CURLOPT_USE_SSL        => CURLUSESSL_ALL,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_CONNECTTIMEOUT => 10,          // 10s to connect
        CURLOPT_TIMEOUT        => 20,          // 20s total
        CURLOPT_RETURNTRANSFER => true,
    ]);

    // Execute FIRST, then check for errors (critical order!)
    curl_exec($curl);
    $errno = curl_errno($curl);
    $error = curl_error($curl);
    curl_close($curl);
    fclose($stream);

    if ($errno !== 0) {
        throw new RuntimeException("cURL SMTP error ({$errno}): {$error}");
    }
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

function respond(int $status, bool $success, string $message): void {
    http_response_code($status);
    echo json_encode([
        'success' => $success,
        'message' => $message,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

function clean(string $value): string {
    return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
}

function is_valid_email(string $email): bool {
    return (bool) filter_var($email, FILTER_VALIDATE_EMAIL);
}

function check_rate_limit(string $ip): bool {
    if (!is_dir(RATE_LIMIT_DIR)) {
        mkdir(RATE_LIMIT_DIR, 0700, true);
        file_put_contents(RATE_LIMIT_DIR . '/.htaccess', "Deny from all\n");
    }

    $file = RATE_LIMIT_DIR . '/' . md5($ip) . '.json';
    $now  = time();

    $records = [];
    if (file_exists($file)) {
        $data = json_decode(file_get_contents($file), true);
        if (is_array($data)) {
            $records = array_filter($data, fn($ts) => ($now - $ts) < RATE_LIMIT_WINDOW);
        }
    }

    if (count($records) >= RATE_LIMIT_MAX) {
        return false;
    }

    $records[] = $now;
    file_put_contents($file, json_encode(array_values($records)), LOCK_EX);

    return true;
}

function gc_rate_limits(): void {
    if (mt_rand(1, 20) !== 1) return;
    if (!is_dir(RATE_LIMIT_DIR)) return;

    $now = time();
    foreach (glob(RATE_LIMIT_DIR . '/*.json') as $file) {
        if (($now - filemtime($file)) > RATE_LIMIT_WINDOW * 2) {
            @unlink($file);
        }
    }
}

function build_email_html(array $data): string {
    $services = $data['services'] ? $data['services'] : '<em>Not specified</em>';
    $timeline = $data['timeline'] ? $data['timeline'] : '<em>Not specified</em>';
    $company  = $data['company']  ? $data['company']  : '<em>Not provided</em>';
    $date     = date('F j, Y \a\t g:i A T');

    return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#111111;border-radius:12px;overflow:hidden;border:1px solid #222;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#ff5500 0%,#cc4400 100%);padding:32px 40px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">
                New Project Inquiry
              </h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">
                {$date}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:12px 16px;background:#1a1a1a;border-radius:8px;border-left:3px solid #ff5500;">
                    <p style="margin:0 0 4px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Client Name</p>
                    <p style="margin:0;color:#fff;font-size:16px;font-weight:600;">{$data['name']}</p>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td width="50%" style="padding:12px 16px;background:#1a1a1a;border-radius:8px 0 0 8px;border-left:3px solid #ff5500;">
                    <p style="margin:0 0 4px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Email</p>
                    <p style="margin:0;color:#22d3ee;font-size:14px;">
                      <a href="mailto:{$data['email']}" style="color:#22d3ee;text-decoration:none;">{$data['email']}</a>
                    </p>
                  </td>
                  <td width="50%" style="padding:12px 16px;background:#1a1a1a;border-radius:0 8px 8px 0;">
                    <p style="margin:0 0 4px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Company</p>
                    <p style="margin:0;color:#fff;font-size:14px;">{$company}</p>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td width="60%" style="padding:12px 16px;background:#1a1a1a;border-radius:8px 0 0 8px;border-left:3px solid #ff5500;">
                    <p style="margin:0 0 4px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Services Needed</p>
                    <p style="margin:0;color:#fff;font-size:14px;">{$services}</p>
                  </td>
                  <td width="40%" style="padding:12px 16px;background:#1a1a1a;border-radius:0 8px 8px 0;">
                    <p style="margin:0 0 4px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Timeline</p>
                    <p style="margin:0;color:#fff;font-size:14px;">{$timeline}</p>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:16px;background:#1a1a1a;border-radius:8px;border-left:3px solid #ff5500;">
                    <p style="margin:0 0 8px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Project Description</p>
                    <p style="margin:0;color:#e0e0e0;font-size:14px;line-height:1.7;white-space:pre-wrap;">{$data['message']}</p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;background:#0d0d0d;border-top:1px solid #222;">
              <p style="margin:0;color:#555;font-size:12px;text-align:center;">
                This email was sent from the contact form on <strong style="color:#888;">Krado</strong> website.
                <br>Reply directly to this email to respond to <strong style="color:#888;">{$data['name']}</strong>.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
HTML;
}

// ─── MAIN REQUEST HANDLER ────────────────────────────────────────────────────

header('Content-Type: application/json; charset=utf-8');

// ── CORS ──
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, ALLOWED_ORIGINS, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Max-Age: 86400');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, false, 'Method not allowed. Use POST.');
}

$raw  = file_get_contents('php://input');
$body = json_decode($raw, true);

if (!is_array($body)) {
    respond(400, false, 'Invalid request body.');
}

// ── Honeypot ──
if (!empty($body['website'] ?? '')) {
    respond(200, true, 'Thank you! We will get back to you soon.');
}

// ── Sanitize ──
$name     = clean($body['name']     ?? '');
$email    = clean($body['email']    ?? '');
$company  = clean($body['company']  ?? '');
$message  = clean($body['message']  ?? '');
$services = clean($body['services'] ?? '');
$timeline = clean($body['timeline'] ?? '');

// ── Validate ──
$errors = [];

if (mb_strlen($name) < 2)    $errors[] = 'Name must be at least 2 characters.';
if (mb_strlen($name) > 100)  $errors[] = 'Name is too long (max 100 characters).';
if (!is_valid_email($email))  $errors[] = 'Please provide a valid email address.';
if (mb_strlen($message) < 10) $errors[] = 'Message must be at least 10 characters.';
if (mb_strlen($message) > 5000) $errors[] = 'Message is too long (max 5000 characters).';
if (mb_strlen($company) > 100)  $errors[] = 'Company name is too long (max 100 characters).';

if (!empty($errors)) {
    respond(422, false, implode(' ', $errors));
}

// ── Rate limit ──
$clientIP = trim(explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['HTTP_X_REAL_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0')[0]);

if (!check_rate_limit($clientIP)) {
    respond(429, false, 'Too many requests. Please try again later.');
}

// ── Send ──
$data = compact('name', 'email', 'company', 'message', 'services', 'timeline');
$subject  = "New Project Inquiry from {$name} — " . SITE_NAME;
$htmlBody = build_email_html($data);

try {
    smtp_send(MAIL_TO, $subject, $htmlBody, $email, $name);
    gc_rate_limits();
    respond(200, true, 'Thank you! We have received your project details and will follow up within 24 hours.');
} catch (RuntimeException $e) {
    error_log("[Krado Contact] SMTP error: " . $e->getMessage() . " | From: {$email} | " . date('Y-m-d H:i:s'));
    respond(500, false, 'Sorry, there was a problem sending your message. Please email us directly at info@kradotech.com');
}
