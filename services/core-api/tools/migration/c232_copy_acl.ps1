param([Parameter(Mandatory=$true)][string]$Directory,
      [Parameter(Mandatory=$true)][string]$Source)
$ErrorActionPreference = 'Stop'
try {
    $sid = [System.Security.Principal.WindowsIdentity]::GetCurrent().User
    if ($null -eq $sid) { exit 2 }
    foreach ($path in @($Directory, $Source)) {
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
        if ($path -eq $Directory -and (-not $acl.AreAccessRulesProtected -or $rule.IsInherited)) { exit 2 }
    }
    Write-Output 'OK'
    exit 0
} catch { exit 2 }
