<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => true, 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$nome = isset($input['nome']) ? trim($input['nome']) : 'Cliente';
$email = isset($input['email']) ? trim($input['email']) : '';

function generateCPF() {
    $n = array();
    for ($i = 0; $i < 9; $i++) {
        $n[] = rand(0, 9);
    }
    
    $d1 = 0;
    for ($i = 0; $i < 9; $i++) {
        $d1 += $n[$i] * (10 - $i);
    }
    $d1 = 11 - ($d1 % 11);
    if ($d1 >= 10) $d1 = 0;
    
    $d2 = $d1 * 2;
    for ($i = 0; $i < 9; $i++) {
        $d2 += $n[$i] * (11 - $i);
    }
    $d2 = 11 - ($d2 % 11);
    if ($d2 >= 10) $d2 = 0;
    
    return implode('', $n) . $d1 . $d2;
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $clean_name = preg_replace('/[^a-zA-Z0-9]/', '', strtolower($nome));
    if (empty($clean_name)) $clean_name = 'cliente';
    $email = $clean_name . rand(100, 9999) . '@gmail.com';
}
$phone = '119' . rand(70000000, 99999999);
$cpf = generateCPF();

$amount_cents = 2200;
$offer_hash = "ureuv";
$price_label = "R$ 22,00";
$api_token = "S2FWYlgGf5axe3cPUNlm6mlQewNVfo2W3cqq8NPqDC7RNnap6bSpU6EYEeAf";

$payload = [
    "amount" => $amount_cents,
    "offer_hash" => $offer_hash,
    "payment_method" => "pix",
    "customer" => [
        "name" => $nome,
        "email" => $email,
        "phone_number" => $phone,
        "document" => $cpf
    ],
    "cart" => [
        [
            "product_hash" => "aeidhcjnp6",
            "title" => "Taxa de Liberacao " . $price_label,
            "price" => $amount_cents,
            "quantity" => 1,
            "operation_type" => 1,
            "tangible" => false
        ]
    ]
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://api.ironpayapp.com.br/api/public/v1/transactions?api_token=" . $api_token);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code === 201 || $http_code === 200) {
    $data = json_decode($response, true);
    if (isset($data['hash']) && isset($data['pix']['pix_qr_code'])) {
        echo json_encode([
            'payment_code' => $data['hash'],
            'pix_code' => $data['pix']['pix_qr_code'],
            'price_label' => $price_label
        ]);
        exit;
    }
}

echo json_encode(['error' => true, 'message' => 'Erro ao processar transacao no gateway']);
