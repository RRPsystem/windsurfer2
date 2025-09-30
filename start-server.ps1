<#
    Simple HTTP Server for Website Builder
    - Accepts optional -Port parameter
    - Auto-picks a free port if the requested/default one is in use
#>

param(
    [int]$Port = 8080
)

function Test-PortFree([int]$p) {
    $tcp = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $p)
    try {
        $tcp.Start(); $true
    } catch {
        $false
    } finally {
        try { $tcp.Stop() } catch {}
    }
}

# If chosen port is busy, try a few alternatives automatically
if (-not (Test-PortFree $Port)) {
    $candidates = @($Port, 8081, 8082, 5500, 5173, 3000, 3001) | Select-Object -Unique
    foreach ($p in $candidates) {
        if (Test-PortFree $p) { $Port = $p; break }
    }
}

$url = "http://localhost:$Port"
Write-Host "Starting HTTP Server on port $Port..." -ForegroundColor Green
Write-Host "Open your browser and go to: $url" -ForegroundColor Cyan

# Start simple HTTP listener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("$url/")

try {
    $listener.Start()
} catch {
    Write-Warning "Kon niet luisteren op poort $Port. Probeer een andere poort: ./start-server.ps1 -Port 8081"
    throw
}

Write-Host "Server is running. Press Ctrl+C to stop." -ForegroundColor Yellow

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $localPath = $request.Url.LocalPath
        if ($localPath -eq "/") {
            $localPath = "/index.html"
        }
        # Serve index.html for any directory path ending with '/'
        if ($localPath.EndsWith('/')) {
            $localPath = "$localPath" + "index.html"
        }

        $filePath = Join-Path $PSScriptRoot $localPath.TrimStart('/')

        # If not found, try rewrite from /widgets/... -> /public/widgets/...
        if (-not (Test-Path $filePath) -and $localPath.StartsWith('/widgets/')) {
            $altPath = $localPath -replace '^/widgets/', '/public/widgets/'
            $filePath = Join-Path $PSScriptRoot $altPath.TrimStart('/')
        }

        if (Test-Path $filePath) {
            $content = Get-Content $filePath -Raw -Encoding UTF8
            
            # Set content type based on file extension
            $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
            switch ($extension) {
                ".html" { $response.ContentType = "text/html; charset=utf-8" }
                ".css"  { $response.ContentType = "text/css; charset=utf-8" }
                ".js"   { $response.ContentType = "application/javascript; charset=utf-8" }
                ".json" { $response.ContentType = "application/json; charset=utf-8" }
                ".png"  { $response.ContentType = "image/png" }
                ".jpg"  { $response.ContentType = "image/jpeg" }
                ".jpeg" { $response.ContentType = "image/jpeg" }
                ".gif"  { $response.ContentType = "image/gif" }
                ".ico"  { $response.ContentType = "image/x-icon" }
                default  { $response.ContentType = "text/plain; charset=utf-8" }
            }
            
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($content)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        } else {
            $response.StatusCode = 404
            $notFound = "404 - File Not Found: $localPath"
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($notFound)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        }
        
        $response.OutputStream.Close()
        
        Write-Host "$($request.HttpMethod) $($request.Url.LocalPath) - $($response.StatusCode)" -ForegroundColor Gray
    }
} finally {
    if ($listener -and $listener.IsListening) { try { $listener.Stop() } catch {} }
    Write-Host "Server stopped." -ForegroundColor Red
}
