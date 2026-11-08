param([Parameter(Mandatory = $true)][string]$LiteralDirectory)

$ErrorActionPreference = 'Stop'
try {
    $directory = [System.IO.DirectoryInfo]::new([System.IO.Path]::GetFullPath($LiteralDirectory))
    $current = $directory
    while ($null -ne $current) {
        $item = Get-Item -LiteralPath $current.FullName -Force
        if (($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) { exit 2 }
        $current = $current.Parent
    }
    $sid = [System.Security.Principal.WindowsIdentity]::GetCurrent().User
    if ($null -eq $sid) { exit 2 }
    $paths = @($directory.FullName, (Join-Path $directory.FullName 'state.json'),
               (Join-Path $directory.FullName 'migrator_password'),
               (Join-Path $directory.FullName 'bootstrap_password'),
               (Join-Path $directory.FullName 'app_password'))
    foreach ($path in $paths) {
        $item = Get-Item -LiteralPath $path -Force
        if (($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) { exit 2 }
        $acl = Get-Acl -LiteralPath $path
        $owner = $acl.GetOwner([System.Security.Principal.SecurityIdentifier])
        $rules = @($acl.Access)
        if ($owner.Value -ne $sid.Value -or $rules.Count -ne 1) { exit 2 }
        $rule = $rules[0]
        $ruleSid = $rule.IdentityReference.Translate([System.Security.Principal.SecurityIdentifier])
        $full = [System.Security.AccessControl.FileSystemRights]::FullControl
        if ($ruleSid.Value -ne $sid.Value -or $rule.AccessControlType -ne 'Allow' -or
            ($rule.FileSystemRights -band $full) -ne $full) { exit 2 }
        if ($path -eq $directory.FullName -and (-not $acl.AreAccessRulesProtected -or $rule.IsInherited)) { exit 2 }
    }
    Write-Output 'OK'
    exit 0
} catch {
    exit 2
}
