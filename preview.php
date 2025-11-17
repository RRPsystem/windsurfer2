<?php
// Preview page for template drafts
// URL: preview.php?brand_id=xxx&template=gotur

// Get parameters
$brandId = $_GET['brand_id'] ?? null;
$template = $_GET['template'] ?? null;

if (!$brandId || !$template) {
    die('Missing parameters: brand_id and template required');
}

// Supabase configuration
$supabaseUrl = 'https://huaaogdxxdcakxryecnw.supabase.co';
$supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1YWFvZ2R4eGRjYWt4cnllY253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MjA5NzIsImV4cCI6MjA0NjM5Njk3Mn0.FMH7VZBvPQFMX8lGPDHLYkPTdKs6_Rw-RMQqXgfFPQs';

// Fetch draft from Supabase
$url = "$supabaseUrl/rest/v1/template_drafts?brand_id=eq.$brandId&template=eq.$template&select=*";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "apikey: $supabaseKey",
    "Authorization: Bearer $supabaseKey",
    "Content-Type: application/json"
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    die("Error fetching draft: HTTP $httpCode");
}

$data = json_decode($response, true);

if (empty($data)) {
    die('No draft found for this brand and template');
}

$draft = $data[0];
$pages = $draft['pages'] ?? [];

if (empty($pages)) {
    die('No pages found in draft');
}

// Get the first page HTML
$html = $pages[0]['html'] ?? '';

if (empty($html)) {
    die('No HTML content found');
}

// Output the HTML directly
echo $html;
?>
