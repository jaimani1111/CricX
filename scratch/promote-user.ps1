param(
    [Parameter(Mandatory=$true)]
    [string]$Email,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("SUPER_ADMIN", "ADMIN", "PLAYER")]
    [string]$Role = "SUPER_ADMIN"
)

$url = "http://localhost:8080/api/auth/promote-role"
$body = @{
    email = $Email
    role = $Role
} | ConvertTo-Json

Write-Host "Promoting $Email to $Role..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json"
    Write-Host "Success: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
