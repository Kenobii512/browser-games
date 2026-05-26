$input_str = $input | Out-String
try { $data = $input_str | ConvertFrom-Json } catch { $data = $null }

$e      = [char]27
$cyan   = "$e[0;36m"; $yellow = "$e[0;33m"; $green = "$e[0;32m"
$red    = "$e[0;31m"; $reset  = "$e[0m"

$model = if ($data.model.display_name) { $data.model.display_name } else { "Claude" }

$repo = if ($data.workspace.repo) { "$($data.workspace.repo.owner)/$($data.workspace.repo.name)" } else { $null }
$loc  = if ($repo) { $repo } else { $data.cwd }

$branch = ""
$cwd = $data.cwd
if ($cwd) {
    $branch = & "C:\Program Files\Git\bin\git.exe" -C $cwd symbolic-ref --short HEAD 2>$null
    if ($LASTEXITCODE -ne 0 -or -not $branch) {
        $branch = & "C:\Program Files\Git\bin\git.exe" -C $cwd rev-parse --short HEAD 2>$null
        if ($LASTEXITCODE -ne 0) { $branch = "" }
    }
    if ($branch) { $branch = $branch.Trim() }
}

$remaining = $data.context_window.remaining_percentage
$ctxColor = if ($remaining -le 20) { $red } elseif ($remaining -le 50) { $yellow } else { $green }

$out = "${cyan}${model}${reset} ${yellow}${loc}${reset}"
if ($branch) { $out += " ${green}(${branch})${reset}" }
if ($null -ne $remaining) { $out += " ${ctxColor}ctx:$([int]$remaining)%${reset}" }

Write-Host $out
