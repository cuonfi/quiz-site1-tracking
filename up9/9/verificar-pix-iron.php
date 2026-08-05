<?php
header('Content-Type: application/json');

$code = isset($_GET['code']) ? trim($_GET['code']) : '';

if (empty($code)) {
    echo json_encode(['status' => 'pending', 'error' => 'Missing code']);
    exit;
}

$api_token = "S2FWYlgGf5axe3cPUNlm6mlQewNVfo2W3cqq8NPqDC7RNnap6bSpU6EYEeAf";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://api.ironpayapp.com.br/api/public/v1/transactions/" . urlencode($code) . "?api_token=" . $api_token);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json'
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code === 200) {
    $data = json_decode($response, true);
    $status = isset($data['payment_status']) ? $data['payment_status'] : (isset($data['status']) ? $data['status'] : '');
    
    if ($status === 'paid' || $status === 'approved') {
        echo json_encode([
            'status' => 'approved',
            'obrigado_url' => "../../up10/index.html"
        ]);
        exit;
    }
}

echo json_encode(['status' => 'pending']);
