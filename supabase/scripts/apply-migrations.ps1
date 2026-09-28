<#
.SYNOPSIS
    Aplica as migrations do projeto no Supabase usando a Management API
    (funciona sem redefinir a senha do banco e sem a role cli_login_postgres,
    que esta quebrada neste projeto: supabase/cli#5091).

.PARAMETER Token
    Personal Access Token. Se omitido, usa $env:SUPABASE_ACCESS_TOKEN.
    Crie em https://supabase.com/dashboard/account/tokens

.PARAMETER Ref
    Project ref. Padrao: wdybtosjzpexycvgreph

.PARAMETER Files
    Migrations a aplicar, em ordem.

.EXAMPLE
    $env:SUPABASE_ACCESS_TOKEN = "sbp_..."
    .\supabase\scripts\apply-migrations.ps1
    .\supabase\scripts\verify-public-access.ps1
#>
[CmdletBinding()]
param(
    [string]$Token = $env:SUPABASE_ACCESS_TOKEN,
    [string]$Ref = 'wdybtosjzpexycvgreph',
    [string[]]$Files = @(
        'supabase/migrations/20260227_ensure_storage_buckets.sql',
        'supabase/migrations/20260228_public_share_secure_access.sql'
    ),
    [switch]$SkipInviteCleanup
)

$ErrorActionPreference = 'Stop'

if (-not $Token) {
    throw 'Informe o PAT: $env:SUPABASE_ACCESS_TOKEN = "sbp_..." ou -Token "sbp_..."'
}

function Invoke-SupabaseQuery {
    param(
        [Parameter(Mandatory)][string]$Sql,
        [Parameter(Mandatory)][string]$Label
    )

    $uri = "https://api.supabase.com/v1/projects/$Ref/database/query"
    $json = @{ query = $Sql } | ConvertTo-Json -Depth 5 -Compress
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)

    Write-Host "==> $Label" -ForegroundColor Cyan
    $res = Invoke-RestMethod -Uri $uri -Method Post `
        -Headers @{ Authorization = "Bearer $Token" } `
        -ContentType 'application/json; charset=utf-8' `
        -Body $bytes

    if ($res) { $res | Format-Table | Out-String | Write-Host }
}

foreach ($file in $Files) {
    if (-not (Test-Path $file)) { throw "Arquivo nao encontrado: $file" }
    $sql = Get-Content -Raw -Encoding UTF8 $file
    Invoke-SupabaseQuery -Sql $sql -Label $file
}

# Registra no historico para que um futuro `supabase db push` nao reaplicar.
# (As duas migrations sao idempotentes, entao falhar aqui nao e perigoso.)
$history = @(
    @{ version = '20260227'; name = 'ensure_storage_buckets' },
    @{ version = '20260228'; name = 'public_share_secure_access' }
)

foreach ($m in $history) {
    $sql = "insert into supabase_migrations.schema_migrations (version, name) values ('$($m.version)', '$($m.name)') on conflict (version) do nothing;"
    try {
        Invoke-SupabaseQuery -Sql $sql -Label "historico $($m.version)"
    }
    catch {
        Write-Warning "Nao foi possivel registrar $($m.version) no historico: $($_.Exception.Message)"
    }
}

Write-Host ''
Write-Host 'Migrations aplicadas. Agora valide:' -ForegroundColor Green
Write-Host '  .\supabase\scripts\verify-public-access.ps1'