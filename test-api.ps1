#!/usr/bin/env pwsh
# test-api.ps1 — End-to-end API smoke tests for the Equity Trading Portal
# Usage: .\test-api.ps1 [-BaseUrl "http://192.168.1.106:4300"]
param(
    [string]$BaseUrl = "http://192.168.1.106:4300"
)

$ErrorActionPreference = "Continue"

# ── Helpers ───────────────────────────────────────────────────────────────────

$script:pass = 0
$script:fail = 0

function Invoke-Api {
    param(
        [string]$Method,
        [string]$Path,
        [object]$Body = $null,
        [string]$Token = $null
    )
    $uri     = "$BaseUrl$Path"
    $headers = @{ "Content-Type" = "application/json" }
    if ($Token) { $headers["Authorization"] = "Bearer $Token" }

    $params = @{ Method = $Method; Uri = $uri; Headers = $headers; UseBasicParsing = $true }
    if ($Body) { $params["Body"] = ($Body | ConvertTo-Json -Depth 10) }

    try {
        $resp = Invoke-WebRequest @params
        return @{ Status = [int]$resp.StatusCode; Body = ($resp.Content | ConvertFrom-Json -ErrorAction SilentlyContinue); Raw = $resp.Content }
    } catch {
        $code = 0
        $raw  = ""
        try { $code = [int]$_.Exception.Response.StatusCode } catch {}
        try {
            $s = $_.Exception.Response.GetResponseStream()
            $raw = (New-Object System.IO.StreamReader($s)).ReadToEnd()
        } catch {}
        return @{ Status = $code; Body = ($raw | ConvertFrom-Json -ErrorAction SilentlyContinue); Raw = $raw }
    }
}

function Assert-Status {
    param([string]$Name, [hashtable]$R, [int]$Expect)
    if ($R.Status -eq $Expect) {
        Write-Host "  [PASS] $Name (HTTP $($R.Status))" -ForegroundColor Green
        $script:pass++
    } else {
        Write-Host "  [FAIL] $Name — expected $Expect, got $($R.Status)" -ForegroundColor Red
        if ($R.Raw) { Write-Host "         $($R.Raw.Substring(0, [Math]::Min(200,$R.Raw.Length)))" -ForegroundColor DarkRed }
        $script:fail++
    }
}

function Assert-Field {
    param([string]$Name, [object]$Body, [string]$Field)
    $val = $Body.$Field
    if ($null -ne $val -and "$val" -ne "") {
        Write-Host "  [PASS] $Name ('$Field' present)" -ForegroundColor Green
        $script:pass++
    } else {
        Write-Host "  [FAIL] $Name — field '$Field' missing or null" -ForegroundColor Red
        $script:fail++
    }
}

function Assert-Equals {
    param([string]$Name, $Actual, $Expected)
    if ($Actual -eq $Expected) {
        Write-Host "  [PASS] $Name ($Actual)" -ForegroundColor Green
        $script:pass++
    } else {
        Write-Host "  [FAIL] $Name — expected '$Expected', got '$Actual'" -ForegroundColor Red
        $script:fail++
    }
}

# ── Main test flow ────────────────────────────────────────────────────────────

$ts        = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$testEmail = "smoketest_$ts@example.com"
$testPass  = "SmokeTest123!"

Write-Host ""
Write-Host "=== Equity Trading Portal — API Smoke Tests ===" -ForegroundColor Cyan
Write-Host "    Target : $BaseUrl"
Write-Host "    User   : $testEmail"
Write-Host ""

# ── Auth ──────────────────────────────────────────────────────────────────────
Write-Host "[ Auth ]" -ForegroundColor Yellow

$r = Invoke-Api POST "/api/auth/register" @{ email = $testEmail; password = $testPass }
Assert-Status "POST /api/auth/register" $r 201

$r = Invoke-Api POST "/api/auth/register" @{ email = $testEmail; password = $testPass }
Assert-Status "POST /api/auth/register (duplicate) → 409" $r 409

$r = Invoke-Api POST "/api/auth/login" @{ email = $testEmail; password = "WrongPass!" }
Assert-Status "POST /api/auth/login (bad password) → 401" $r 401

$r = Invoke-Api POST "/api/auth/login" @{ email = $testEmail; password = $testPass }
Assert-Status "POST /api/auth/login" $r 200
Assert-Field  "Login returns accessToken"  $r.Body "accessToken"
Assert-Field  "Login returns refreshToken" $r.Body "refreshToken"
$token        = $r.Body.accessToken
$refreshToken = $r.Body.refreshToken

# ── Unauthenticated access ────────────────────────────────────────────────────
Write-Host ""
Write-Host "[ Unauthenticated access ]" -ForegroundColor Yellow

$r = Invoke-Api GET "/api/profile"
if ($r.Status -eq 401 -or $r.Status -eq 403) {
    Write-Host "  [PASS] GET /api/profile (no token) → $($r.Status)" -ForegroundColor Green; $script:pass++
} else {
    Write-Host "  [FAIL] GET /api/profile (no token) expected 401/403, got $($r.Status)" -ForegroundColor Red; $script:fail++
}

$r = Invoke-Api POST "/api/portfolio/recommend"
if ($r.Status -eq 401 -or $r.Status -eq 403) {
    Write-Host "  [PASS] POST /api/portfolio/recommend (no token) → $($r.Status)" -ForegroundColor Green; $script:pass++
} else {
    Write-Host "  [FAIL] POST /api/portfolio/recommend (no token) expected 401/403, got $($r.Status)" -ForegroundColor Red; $script:fail++
}

# ── Profile ───────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "[ Profile ]" -ForegroundColor Yellow

$r = Invoke-Api GET "/api/profile" -Token $token
Assert-Status "GET /api/profile (none yet) → 404" $r 404

$r = Invoke-Api POST "/api/profile" @{
    riskTolerance    = "MODERATE"
    experience       = "INTERMEDIATE"
    incomeBracket    = "BETWEEN_60K_100K"
    netWorthBand     = "BETWEEN_250K_1M"
    horizonMonths    = 36
    regions          = @("NORTH_AMERICA", "EUROPE")
    targetRoiPercent = 8.5
} -Token $token
Assert-Status "POST /api/profile" $r 201
Assert-Field  "Profile has riskTolerance"  $r.Body "riskTolerance"
Assert-Field  "Profile has horizonMonths"  $r.Body "horizonMonths"

$r = Invoke-Api GET "/api/profile" -Token $token
Assert-Status "GET /api/profile" $r 200
Assert-Equals "riskTolerance = MODERATE" $r.Body.riskTolerance "MODERATE"
Assert-Equals "horizonMonths = 36"       $r.Body.horizonMonths 36

$r = Invoke-Api PUT "/api/profile" @{
    riskTolerance    = "AGGRESSIVE"
    experience       = "ADVANCED"
    incomeBracket    = "OVER_200K"
    netWorthBand     = "OVER_5M"
    horizonMonths    = 120
    regions          = @("NORTH_AMERICA")
    targetRoiPercent = 15.0
} -Token $token
Assert-Status "PUT /api/profile" $r 200
Assert-Equals "Updated riskTolerance = AGGRESSIVE" $r.Body.riskTolerance "AGGRESSIVE"
Assert-Equals "Updated horizonMonths = 120"        $r.Body.horizonMonths 120

# ── Portfolio ─────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "[ Portfolio ]" -ForegroundColor Yellow

$r = Invoke-Api POST "/api/portfolio/recommend" -Token $token
Assert-Status "POST /api/portfolio/recommend" $r 200
Assert-Field  "Recommendation has id"                    $r.Body "id"
Assert-Field  "Recommendation has allocations"           $r.Body "allocations"
Assert-Field  "Recommendation has expectedReturnPercent" $r.Body "expectedReturnPercent"
Assert-Field  "Recommendation has volatilityPercent"     $r.Body "volatilityPercent"
Assert-Field  "Recommendation has generatedAt"           $r.Body "generatedAt"

$recId = $r.Body.id
$allocs = $r.Body.allocations

if ($allocs -and $allocs.Count -gt 0) {
    Write-Host "  [PASS] Recommendation has $($allocs.Count) allocations" -ForegroundColor Green; $script:pass++

    $weightSum = 0.0
    foreach ($a in $allocs) { $weightSum += [double]$a.weightPercent }
    if ([Math]::Abs($weightSum - 100.0) -lt 0.1) {
        Write-Host "  [PASS] Weights sum to ~100% ($([Math]::Round($weightSum,2)))" -ForegroundColor Green; $script:pass++
    } else {
        Write-Host "  [FAIL] Weights sum to $weightSum (expected ~100)" -ForegroundColor Red; $script:fail++
    }

    $maxW = ($allocs | ForEach-Object { [double]$_.weightPercent } | Measure-Object -Maximum).Maximum
    if ($maxW -le 40.0) {
        Write-Host "  [PASS] Max weight $maxW% <= 40%" -ForegroundColor Green; $script:pass++
    } else {
        Write-Host "  [FAIL] Max weight $maxW% exceeds 40%" -ForegroundColor Red; $script:fail++
    }

    $nullInstruments = $allocs | Where-Object { -not $_.instrumentId }
    if ($nullInstruments.Count -eq 0) {
        Write-Host "  [PASS] All allocations have non-null instrumentId" -ForegroundColor Green; $script:pass++
    } else {
        Write-Host "  [FAIL] $($nullInstruments.Count) allocation(s) have null instrumentId" -ForegroundColor Red; $script:fail++
    }
} else {
    Write-Host "  [FAIL] Recommendation has no allocations" -ForegroundColor Red; $script:fail++
}

$r = Invoke-Api GET "/api/portfolio/history" -Token $token
Assert-Status "GET /api/portfolio/history" $r 200
if ($r.Body -and $r.Body.Count -gt 0) {
    Write-Host "  [PASS] History has $($r.Body.Count) entry/entries" -ForegroundColor Green; $script:pass++
} else {
    Write-Host "  [FAIL] History empty after generating recommendation" -ForegroundColor Red; $script:fail++
}

if ($recId) {
    $r = Invoke-Api GET "/api/portfolio/history/$recId" -Token $token
    Assert-Status "GET /api/portfolio/history/{id}" $r 200
    Assert-Equals "History item ID matches" $r.Body.id $recId
}

# ── No-profile user → 404 on recommend ───────────────────────────────────────
Write-Host ""
Write-Host "[ Error cases ]" -ForegroundColor Yellow

$ts2    = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$email2 = "noprofile_$ts2@example.com"
Invoke-Api POST "/api/auth/register" @{ email = $email2; password = $testPass } | Out-Null
$r2     = Invoke-Api POST "/api/auth/login" @{ email = $email2; password = $testPass }
$tok2   = $r2.Body.accessToken
$r      = Invoke-Api POST "/api/portfolio/recommend" -Token $tok2
Assert-Status "POST /api/portfolio/recommend (no profile) → 404" $r 404

# ── Token refresh & logout ────────────────────────────────────────────────────
Write-Host ""
Write-Host "[ Token lifecycle ]" -ForegroundColor Yellow

$r = Invoke-Api POST "/api/auth/refresh" @{ refreshToken = $refreshToken }
Assert-Status "POST /api/auth/refresh" $r 200
Assert-Field  "Refresh returns new accessToken" $r.Body "accessToken"
$newToken = $r.Body.accessToken

$r = Invoke-Api POST "/api/auth/logout" @{ refreshToken = $refreshToken } -Token $newToken
Assert-Status "POST /api/auth/logout → 204" $r 204

$r = Invoke-Api POST "/api/auth/refresh" @{ refreshToken = $refreshToken }
Assert-Status "POST /api/auth/refresh (after logout) → 401" $r 401

# ── Summary ───────────────────────────────────────────────────────────────────

$total = $script:pass + $script:fail
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
$color = if ($script:fail -eq 0) { "Green" } else { "Red" }
Write-Host "  $($script:pass) passed  /  $($script:fail) failed  (total $total)" -ForegroundColor $color
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

if ($script:fail -gt 0) { exit 1 } else { exit 0 }
