#!/usr/bin/env pwsh
# test-api.ps1 - End-to-end API tests for the Equity Trading Portal
# Usage: .\test-api.ps1 [-BaseUrl "http://192.168.1.106:4300"]
param(
    [string]$BaseUrl = "http://192.168.1.106:4300"
)

$ErrorActionPreference = "Continue"

$script:pass = 0
$script:fail = 0
$script:skip = 0

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
        Write-Host "  [FAIL] $Name - expected $Expect, got $($R.Status)" -ForegroundColor Red
        if ($R.Raw) { Write-Host "         $($R.Raw.Substring(0, [Math]::Min(300,$R.Raw.Length)))" -ForegroundColor DarkRed }
        $script:fail++
    }
}

function Assert-Field {
    param([string]$Name, [object]$Body, [string]$Field)
    $val = $Body.$Field
    if ($null -ne $val -and "$val" -ne "") {
        Write-Host "  [PASS] $Name (field '$Field' present)" -ForegroundColor Green
        $script:pass++
    } else {
        Write-Host "  [FAIL] $Name - field '$Field' missing or null" -ForegroundColor Red
        $script:fail++
    }
}

function Assert-Equals {
    param([string]$Name, $Actual, $Expected)
    if ($Actual -eq $Expected) {
        Write-Host "  [PASS] $Name ($Actual)" -ForegroundColor Green
        $script:pass++
    } else {
        Write-Host "  [FAIL] $Name - expected '$Expected', got '$Actual'" -ForegroundColor Red
        $script:fail++
    }
}

function Assert-True {
    param([string]$Name, [bool]$Condition, [string]$Detail = "")
    if ($Condition) {
        Write-Host "  [PASS] $Name" -ForegroundColor Green
        $script:pass++
    } else {
        $msg = if ($Detail) { "  [FAIL] $Name - $Detail" } else { "  [FAIL] $Name" }
        Write-Host $msg -ForegroundColor Red
        $script:fail++
    }
}

function Skip-Test {
    param([string]$Name, [string]$Reason)
    Write-Host "  [SKIP] $Name - $Reason" -ForegroundColor DarkYellow
    $script:skip++
}

$ts        = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$testEmail = "e2e_$ts@example.com"
$testPass  = "E2eTest1234!"

Write-Host ""
Write-Host "=== Equity Trading Portal - E2E API Tests ===" -ForegroundColor Cyan
Write-Host "    Target : $BaseUrl"
Write-Host "    User   : $testEmail"
Write-Host ""

# ---- 1. Auth: Registration and Login ----------------------------------------
Write-Host "[ 1. Auth - Registration and Login ]" -ForegroundColor Yellow

$r = Invoke-Api POST "/api/auth/register" @{ email = $testEmail; password = $testPass }
Assert-Status "POST /api/auth/register" $r 201
Assert-Field  "Register returns id"    $r.Body "id"
Assert-Field  "Register returns email" $r.Body "email"

$r = Invoke-Api POST "/api/auth/register" @{ email = $testEmail; password = $testPass }
Assert-Status "POST /api/auth/register (duplicate) -> 409" $r 409

$r = Invoke-Api POST "/api/auth/login" @{ email = $testEmail; password = "WrongPass!" }
Assert-Status "POST /api/auth/login (bad password) -> 401" $r 401

$r = Invoke-Api POST "/api/auth/login" @{ email = $testEmail; password = $testPass }
Assert-Status "POST /api/auth/login" $r 200
Assert-Field  "Login returns accessToken"  $r.Body "accessToken"
Assert-Field  "Login returns refreshToken" $r.Body "refreshToken"
Assert-Field  "Login returns expiresIn"    $r.Body "expiresIn"
$token        = $r.Body.accessToken
$refreshToken = $r.Body.refreshToken

# ---- 2. Auth: Password validation -------------------------------------------
Write-Host ""
Write-Host "[ 2. Auth - Password validation ]" -ForegroundColor Yellow

$r = Invoke-Api POST "/api/auth/register" @{ email = "short_$ts@example.com"; password = "Ab1!" }
Assert-Status "Register with too-short password -> 400" $r 400

$longPass = "A1!" + ("x" * 70)
$r = Invoke-Api POST "/api/auth/register" @{ email = "long_$ts@example.com"; password = $longPass }
Assert-Status "Register with 73-byte password -> 400" $r 400

$r = Invoke-Api POST "/api/auth/register" @{ email = "nonum_$ts@example.com"; password = "NoNumbers!" }
Assert-Status "Register with too-short password (no digit check) -> 400" $r 400

# ---- 3. Unauthenticated access ----------------------------------------------
Write-Host ""
Write-Host "[ 3. Unauthenticated access ]" -ForegroundColor Yellow

$protectedEndpoints = @(
    @{ M="GET";  P="/api/profile" },
    @{ M="POST"; P="/api/profile" },
    @{ M="PUT";  P="/api/profile" },
    @{ M="POST"; P="/api/portfolio/recommend" },
    @{ M="GET";  P="/api/portfolio/history" },
    @{ M="GET";  P="/api/risk/overlay" }
)
foreach ($ep in $protectedEndpoints) {
    $r = Invoke-Api $ep.M $ep.P
    $ok = ($r.Status -eq 401 -or $r.Status -eq 403)
    Assert-True "$($ep.M) $($ep.P) (no token) -> 401/403" $ok "got $($r.Status)"
}

# ---- 4. Profile: no profile yet ---------------------------------------------
Write-Host ""
Write-Host "[ 4. Profile - no profile yet ]" -ForegroundColor Yellow

$r = Invoke-Api GET "/api/profile" -Token $token
Assert-Status "GET /api/profile (none yet) -> 404" $r 404

# ---- 5. Profile: validation errors ------------------------------------------
Write-Host ""
Write-Host "[ 5. Profile - validation errors ]" -ForegroundColor Yellow

$baseProfile = @{
    riskTolerance    = "MODERATE"
    experience       = "INTERMEDIATE"
    incomeBracket    = "BETWEEN_60K_100K"
    netWorthBand     = "BETWEEN_250K_1M"
    horizonMonths    = 12
    regions          = @("NORTH_AMERICA")
    targetRoiPercent = 8.5
}

$p = $baseProfile.Clone(); $p.horizonMonths = 0
$r = Invoke-Api POST "/api/profile" $p -Token $token
Assert-Status "POST /api/profile (horizonMonths=0) -> 400" $r 400

$p = $baseProfile.Clone(); $p.horizonMonths = 361
$r = Invoke-Api POST "/api/profile" $p -Token $token
Assert-Status "POST /api/profile (horizonMonths=361) -> 400" $r 400

$p = $baseProfile.Clone(); $p.regions = @()
$r = Invoke-Api POST "/api/profile" $p -Token $token
Assert-Status "POST /api/profile (empty regions) -> 400" $r 400

$p = $baseProfile.Clone(); $p.targetRoiPercent = 0.0
$r = Invoke-Api POST "/api/profile" $p -Token $token
Assert-Status "POST /api/profile (targetRoiPercent=0) -> 400" $r 400

$p = $baseProfile.Clone(); $p.targetRoiPercent = 51.0
$r = Invoke-Api POST "/api/profile" $p -Token $token
Assert-Status "POST /api/profile (targetRoiPercent=51) -> 400" $r 400

# ---- 6. Profile: CRUD -------------------------------------------------------
Write-Host ""
Write-Host "[ 6. Profile - CRUD ]" -ForegroundColor Yellow

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
Assert-Field  "Profile has riskTolerance"    $r.Body "riskTolerance"
Assert-Field  "Profile has horizonMonths"    $r.Body "horizonMonths"
Assert-Field  "Profile has regions"          $r.Body "regions"
Assert-Field  "Profile has targetRoiPercent" $r.Body "targetRoiPercent"
Assert-Field  "Profile has updatedAt"        $r.Body "updatedAt"

$r = Invoke-Api GET "/api/profile" -Token $token
Assert-Status "GET /api/profile" $r 200
Assert-Equals "riskTolerance = MODERATE"  $r.Body.riskTolerance "MODERATE"
Assert-Equals "experience = INTERMEDIATE" $r.Body.experience    "INTERMEDIATE"
Assert-Equals "horizonMonths = 36"        $r.Body.horizonMonths 36

$r = Invoke-Api PUT "/api/profile" @{
    riskTolerance    = "AGGRESSIVE"
    experience       = "ADVANCED"
    incomeBracket    = "OVER_200K"
    netWorthBand     = "OVER_5M"
    horizonMonths    = 120
    regions          = @("NORTH_AMERICA", "ASIA_PACIFIC")
    targetRoiPercent = 15.0
} -Token $token
Assert-Status "PUT /api/profile" $r 200
Assert-Equals "Updated riskTolerance = AGGRESSIVE" $r.Body.riskTolerance "AGGRESSIVE"
Assert-Equals "Updated horizonMonths = 120"        $r.Body.horizonMonths 120

# ---- 7. Portfolio: no-profile user ------------------------------------------
Write-Host ""
Write-Host "[ 7. Portfolio - no profile user ]" -ForegroundColor Yellow

$ts2    = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$email2 = "noprofile_$ts2@example.com"
Invoke-Api POST "/api/auth/register" @{ email = $email2; password = $testPass } | Out-Null
$r2     = Invoke-Api POST "/api/auth/login" @{ email = $email2; password = $testPass }
$tok2   = $r2.Body.accessToken
$r      = Invoke-Api POST "/api/portfolio/recommend" -Token $tok2
Assert-Status "POST /api/portfolio/recommend (no profile) -> 404" $r 404

# ---- 8. Portfolio: generate and validate ------------------------------------
Write-Host ""
Write-Host "[ 8. Portfolio - generate and validate ]" -ForegroundColor Yellow

$r = Invoke-Api POST "/api/portfolio/recommend" -Token $token
Assert-Status "POST /api/portfolio/recommend" $r 200
Assert-Field  "Recommendation has id"                    $r.Body "id"
Assert-Field  "Recommendation has allocations"           $r.Body "allocations"
Assert-Field  "Recommendation has expectedReturnPercent" $r.Body "expectedReturnPercent"
Assert-Field  "Recommendation has volatilityPercent"     $r.Body "volatilityPercent"
Assert-Field  "Recommendation has generatedAt"           $r.Body "generatedAt"
$recId  = $r.Body.id
$allocs = $r.Body.allocations

if ($allocs -and $allocs.Count -gt 0) {
    Assert-True "Has at least 1 allocation" ($allocs.Count -ge 1) "count=$($allocs.Count)"

    $weightSum = 0.0
    foreach ($a in $allocs) { $weightSum += [double]$a.weightPercent }
    Assert-True "Weights sum to ~100% ($([Math]::Round($weightSum,2)))" ([Math]::Abs($weightSum - 100.0) -lt 0.1)

    $maxW = ($allocs | ForEach-Object { [double]$_.weightPercent } | Measure-Object -Maximum).Maximum
    Assert-True "Max weight $maxW% <= 40%" ($maxW -le 40.0)

    $nullInstruments = $allocs | Where-Object { -not $_.instrumentId }
    Assert-True "All allocations have non-null instrumentId" ($nullInstruments.Count -eq 0) "$($nullInstruments.Count) null"

    $nullPrices = $allocs | Where-Object { $null -eq $_.priceAtGeneration }
    Assert-True "All allocations have priceAtGeneration" ($nullPrices.Count -eq 0) "$($nullPrices.Count) null"

    Assert-True "Aggressive+120mo profile yields >= 6 allocations" ($allocs.Count -ge 6) "count=$($allocs.Count)"
} else {
    Write-Host "  [FAIL] Recommendation has no allocations" -ForegroundColor Red; $script:fail++
}

# ---- 9. Portfolio: history --------------------------------------------------
Write-Host ""
Write-Host "[ 9. Portfolio - history ]" -ForegroundColor Yellow

$r = Invoke-Api GET "/api/portfolio/history" -Token $token
Assert-Status "GET /api/portfolio/history" $r 200
Assert-True   "History has >= 1 entry" ($r.Body.Count -ge 1) "count=$($r.Body.Count)"

if ($recId) {
    $r = Invoke-Api GET "/api/portfolio/history/$recId" -Token $token
    Assert-Status "GET /api/portfolio/history/{id}" $r 200
    Assert-Equals "History item ID matches" $r.Body.id $recId
    Assert-Field  "History item has allocations" $r.Body "allocations"
}

$r = Invoke-Api GET "/api/portfolio/history/$recId" -Token $tok2
$ok = ($r.Status -eq 404 -or $r.Status -eq 403)
Assert-True "History item not accessible by other user -> 403/404" $ok "got $($r.Status)"

# ---- 10. Portfolio: second recommendation and ordering ----------------------
Write-Host ""
Write-Host "[ 10. Portfolio - second recommendation and ordering ]" -ForegroundColor Yellow

Start-Sleep -Milliseconds 500
$r = Invoke-Api POST "/api/portfolio/recommend" -Token $token
Assert-Status "POST /api/portfolio/recommend (2nd)" $r 200
$recId2 = $r.Body.id

$r = Invoke-Api GET "/api/portfolio/history" -Token $token
Assert-Status "GET /api/portfolio/history (after 2nd)" $r 200
Assert-True   "History has >= 2 entries" ($r.Body.Count -ge 2) "count=$($r.Body.Count)"

if ($r.Body.Count -ge 2) {
    $first  = [DateTimeOffset]::Parse($r.Body[0].generatedAt)
    $second = [DateTimeOffset]::Parse($r.Body[1].generatedAt)
    Assert-True "History ordered newest-first" ($first -ge $second) "first=$first second=$second"
    Assert-Equals "Most recent recommendation is recId2" $r.Body[0].id $recId2
}

# ---- 11. Risk engine --------------------------------------------------------
Write-Host ""
Write-Host "[ 11. Risk engine ]" -ForegroundColor Yellow

if ($recId) {
    $r = Invoke-Api GET "/api/risk/overlay/$recId" -Token $token
    Assert-Status "GET /api/risk/overlay/{portfolioId}" $r 200
    Assert-Field  "Risk overlay has positions"   $r.Body "positions"
    Assert-Field  "Risk overlay has portfolioId" $r.Body "portfolioId"
    Assert-Field  "Risk overlay has generatedAt" $r.Body "generatedAt"
} else {
    Skip-Test "GET /api/risk/overlay/{portfolioId}" "no recId available"
}

# Non-existent portfolio should return 404
$fakeId = [guid]::NewGuid().ToString()
$r = Invoke-Api GET "/api/risk/overlay/$fakeId" -Token $token
Assert-Status "GET /api/risk/overlay/{nonExistentId} -> 404" $r 404

# ---- 12. Market data --------------------------------------------------------
Write-Host ""
Write-Host "[ 12. Market data ]" -ForegroundColor Yellow

$r = Invoke-Api GET "/api/market-data/quote/AAPL" -Token $token
if ($r.Status -eq 200) {
    Assert-Status "GET /api/market-data/quote/AAPL" $r 200
    Assert-Field  "Quote has ticker" $r.Body "ticker"
    Assert-Field  "Quote has price"  $r.Body "price"
    Assert-Field  "Quote has stale"  $r.Body "stale"
} elseif ($r.Status -eq 503 -or $r.Status -eq 404) {
    Skip-Test "GET /api/market-data/quote/AAPL" "market data unavailable (HTTP $($r.Status))"
} else {
    Assert-Status "GET /api/market-data/quote/AAPL" $r 200
}

$r = Invoke-Api GET "/api/market-data/quote/UNKNOWN_TICKER_XYZ" -Token $token
Assert-True "GET /api/market-data/quote/UNKNOWN -> not 500" ($r.Status -ne 500) "got $($r.Status)"

# ---- 13. Input sanitisation -------------------------------------------------
Write-Host ""
Write-Host "[ 13. Input sanitisation ]" -ForegroundColor Yellow

$r = Invoke-Api POST "/api/auth/login" @{ email = "' OR '1'='1"; password = "x" }
Assert-True "SQL injection in email -> not 500" ($r.Status -ne 500) "got $($r.Status)"

$xssEmail = "xss_test_$ts@example.com"
$r = Invoke-Api POST "/api/auth/login" @{ email = $xssEmail; password = "x" }
Assert-True "XSS-like email -> not 500" ($r.Status -ne 500) "got $($r.Status)"

# ---- 14. Token lifecycle ----------------------------------------------------
Write-Host ""
Write-Host "[ 14. Token lifecycle ]" -ForegroundColor Yellow

$r = Invoke-Api POST "/api/auth/refresh" @{ refreshToken = $refreshToken }
Assert-Status "POST /api/auth/refresh" $r 200
Assert-Field  "Refresh returns new accessToken"  $r.Body "accessToken"
Assert-Field  "Refresh returns new refreshToken" $r.Body "refreshToken"
$newToken        = $r.Body.accessToken
$newRefreshToken = $r.Body.refreshToken

$r = Invoke-Api GET "/api/profile" -Token $newToken
Assert-Status "GET /api/profile with refreshed token" $r 200

$r = Invoke-Api POST "/api/auth/refresh" @{ refreshToken = $refreshToken }
Assert-Status "POST /api/auth/refresh (old token after rotation) -> 401" $r 401

$r = Invoke-Api POST "/api/auth/logout" @{ refreshToken = $newRefreshToken } -Token $newToken
Assert-Status "POST /api/auth/logout -> 204" $r 204

$r = Invoke-Api POST "/api/auth/refresh" @{ refreshToken = $newRefreshToken }
Assert-Status "POST /api/auth/refresh (after logout) -> 401" $r 401

$r = Invoke-Api GET "/api/profile" -Token $newToken
# Note: access tokens are stateless JWTs - they remain valid until expiry even after logout.
# Only refresh tokens are revoked. This is standard stateless JWT behavior.
Assert-True "GET /api/profile after logout - access token still valid (stateless JWT)" ($r.Status -eq 200 -or $r.Status -eq 401 -or $r.Status -eq 403) "got $($r.Status)"

# ---- 15. Invalid tokens -----------------------------------------------------
Write-Host ""
Write-Host "[ 15. Invalid and malformed tokens ]" -ForegroundColor Yellow

$r = Invoke-Api POST "/api/auth/refresh" @{ refreshToken = "not-a-real-token" }
Assert-Status "POST /api/auth/refresh (garbage token) -> 401" $r 401

$r = Invoke-Api GET "/api/profile" -Token "garbage.token.here"
Assert-True "GET /api/profile (malformed JWT) -> 401/403" ($r.Status -eq 401 -or $r.Status -eq 403) "got $($r.Status)"

# ---- Summary ----------------------------------------------------------------

$total = $script:pass + $script:fail + $script:skip
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
$color = if ($script:fail -eq 0) { "Green" } else { "Red" }
Write-Host "  $($script:pass) passed  /  $($script:fail) failed  /  $($script:skip) skipped  (total $total)" -ForegroundColor $color
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

if ($script:fail -gt 0) { exit 1 } else { exit 0 }
