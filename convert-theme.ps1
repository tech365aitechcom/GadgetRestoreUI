# PowerShell script to convert hardcoded colors to theme variables
$files = @(
    "app\(customer)\profile\page.jsx",
    "app\(customer)\profile\personal-info\page.jsx",
    "app\(customer)\profile\addresses\page.jsx",
    "app\(customer)\profile\addresses\add\page.jsx",
    "app\(customer)\profile\addresses\edit\[id]\page.jsx",
    "app\(customer)\profile\notifications\page.jsx"
)

$replacements = @{
    "bg-\[#050505\]" = "bg-[var(--theme-bg)]"
    "bg-\[#0D0D0F\]" = "bg-[var(--theme-card)]"
    "border-white/5" = "border-[var(--theme-border)]"
    "border-white/10" = "border-[var(--theme-border-strong)]"
    "bg-white/\[0\.04\]" = "bg-[var(--theme-input-bg)]"
    "border-white/40" = "border-[var(--theme-input-border-focus)]"
    "text-white'" = "text-[var(--theme-text-primary)]'"
    'text-white"' = 'text-[var(--theme-text-primary)]"'
    "text-white\s" = "text-[var(--theme-text-primary)] "
    "text-white/" = "text-[var(--theme-text-primary)]/"
    "text-white\}" = "text-[var(--theme-text-primary)]}"
    "text-white/60" = "text-[var(--theme-text-secondary)]"
    "text-white/50" = "text-[var(--theme-text-tertiary)]"
    "text-white/70" = "text-[var(--theme-text-secondary)]"
    "text-white/40" = "text-[var(--theme-text-disabled)]"
    "text-white/30" = "text-[var(--theme-placeholder)]"
    "text-white\s*\}" = "text-[var(--theme-text-primary)] }"
}

foreach ($file in $files) {
    Write-Host "Processing $file..."
    $content = Get-Content $file -Raw
    
    foreach ($pattern in $replacements.Keys) {
        $replacement = $replacements[$pattern]
        $content = $content -replace $pattern, $replacement
    }
    
    Set-Content $file $content -NoNewline
}

Write-Host "Done!"
