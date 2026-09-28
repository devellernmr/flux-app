<#
.SYNOPSIS
    Verificacao READ-ONLY da exposicao anonima e das RPCs publicas.
    Nao altera nada: apenas GET e POST de leitura (as funcoes chamadas sao
    get_public_file, get_public_briefing e get_invite_by_token, todas STABLE).

.EXAMPLE
    .\supabase\scripts\verify-public-access.ps1
    .\supabase\scripts\verify-public-access.ps1 -FileId 9 -BriefingId 1
#>
[CmdletBinding()]
param(
    [string]$Ref = 'wdybtosjzpexycvgreph',
    [string]$AnonKey = $env:VITE_SUPABASE_ANON_KEY,
    [string]$FileId = '9',
    [string]$BriefingId = '1',
    [string]$InviteToken = 'token-inexistente'
)

$ErrorActionPreference = 'Continue'
$ProgressPreference = 'SilentlyContinue'

if (-not $AnonKey) {
    $envFile = Join-Path (Get-Location) '.env.local'
    if (Test-Path $envFile) {
        $line = Get-Content $envFile | Where-Object { $_ -match '^VITE_SUPABASE_ANON_KEY=' } | Select-Object -First 1
        if ($line) { $AnonKey = ($line -split '=', 2)[1].Trim('"') }
    }
}
if (-not $AnonKey) { throw 'Chave anon nao encontrada (use -AnonKey ou defina VITE_SUPABASE_ANON_KEY).' }

$rest = "https://$Ref.supabase.co/rest/v1"
$headers = @{ apikey = $AnonKey; Authorization = "Bearer $AnonKey" }
$headersCount = @{ apikey = $AnonKey; Authorization = "Bearer $AnonKey"; Prefer = 'count=exact' }

function Test-AnonRead {
    param([string]$Table)
    try {
        $r = Invoke-WebRequest -Uri "$rest/$Table`?select=*&limit=1" -Headers $headersCount -UseBasicParsing
        $range = $r.Headers['Content-Range']
        $total = if ($range -match '/(\d+|\*)$') { $Matches[1] } else { '?' }
        $visible = if ($r.Content.Trim() -eq '[]') { 0 } else { 1 }
        return [pscustomobject]@{ Table = $Table; AnonSees = $visible; TotalNoBanco = $total }
    }
    catch {
        return [pscustomobject]@{ Table = $Table; AnonSees = "ERRO $([int]$_.Exception.Response.StatusCode)"; TotalNoBanco = '-' }
    }
}

function Get-Body {
    param($Err)
    if ($Err.ErrorDetails.Message) { return $Err.ErrorDetails.Message }
    try {
        $sr = New-Object System.IO.StreamReader($Err.Exception.Response.GetResponseStream())
        return $sr.ReadToEnd()
    }
    catch { return $Err.Exception.Message }
}

function Test-Rpc {
    param([string]$Name, $Payload)
    $json = $Payload | ConvertTo-Json -Depth 5 -Compress
    try {
        $r = Invoke-RestMethod -Uri "$rest/rpc/$Name" -Method Post -Headers $headers `
            -ContentType 'application/json' -Body ([System.Text.Encoding]::UTF8.GetBytes($json))
        if ($null -eq $r) { $txt = 'null (recurso nao encontrado - esperado)' }
        else { $txt = ($r | ConvertTo-Json -Depth 4 -Compress) }
        if ($txt.Length -gt 200) { $txt = $txt.Substring(0, 200) + '...' }
        return [pscustomobject]@{ Rpc = $Name; Status = 'OK'; Resposta = $txt }
    }
    catch {
        $body = Get-Body $_
        $code = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { '?' }
        if ($body -match 'PGRST202') { $status = 'AUSENTE (ainda nao aplicada)' }
        elseif ($body -match 'PGRST203') { $status = 'AMBIGUA (overload)' }
        else { $status = "ERRO $code" }
        if ($body.Length -gt 200) { $body = $body.Substring(0, 200) + '...' }
        return [pscustomobject]@{ Rpc = $Name; Status = $status; Resposta = $body }
    }
}

Write-Host ''
Write-Host '== 1) Exposicao anonima (apenas apikey, sem sessao) ==' -ForegroundColor Cyan
Write-Host '   Depois da migration, AnonSees deve ser 0 em todas.'
$tables = @('projects', 'files', 'comments', 'project_comments', 'team_invites', 'briefings')
$results = $tables | ForEach-Object { Test-AnonRead $_ }
$results | Format-Table -AutoSize

$leaking = $results | Where-Object { $_.AnonSees -ne 0 -and $_.AnonSees -ne 'ERRO 404' }
if ($leaking) {
    Write-Warning ('AINDA EXPOSTO: ' + (($leaking | ForEach-Object { "$($_.Table) ($($_.AnonSees) linha(s))" }) -join ', '))
}
else {
    Write-Host 'OK: nenhuma tabela publica devolve linha para anonimos.' -ForegroundColor Green
}

Write-Host ''
Write-Host '== 2) RPCs publicas (leitura) ==' -ForegroundColor Cyan
@(
    (Test-Rpc 'get_public_file' @{ p_file_id = $FileId }),
    (Test-Rpc 'get_public_briefing' @{ p_briefing_id = $BriefingId }),
    (Test-Rpc 'get_invite_by_token' @{ p_token = $InviteToken })
) | Format-Table -AutoSize -Wrap

Write-Host ''
Write-Host '== 3) Storage (curl, para ler o corpo do erro) ==' -ForegroundColor Cyan
foreach ($probe in @(
        @{ Nome = 'project-files'; Url = "https://$Ref.supabase.co/storage/v1/object/public/project-files/__probe__/x.png" },
        @{ Nome = 'project-assets'; Url = "https://$Ref.supabase.co/storage/v1/object/public/project-assets/__probe__/x.png" }
    )) {
    $out = & curl.exe -s -w '|HTTP:%{http_code}' $probe.Url
    $body = ($out -join '')
    $verdict = if ($body -match 'Object not found') { 'OK - bucket existe e e publico' }
    elseif ($body -match 'Bucket not found') { 'FALHA - bucket ausente' }
    else { 'revisitar' }
    "{0,-16} {1}  => {2}" -f $probe.Nome, $body.Substring(0, [Math]::Min(110, $body.Length)), $verdict | Write-Host
}
Write-Host ''
