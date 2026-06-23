param()

# Load SMO
[Reflection.Assembly]::LoadWithPartialName("Microsoft.SqlServer.Smo") | Out-Null
[Reflection.Assembly]::LoadWithPartialName("Microsoft.SqlServer.SqlEnum") | Out-Null
[Reflection.Assembly]::LoadWithPartialName("Microsoft.SqlServer.ConnectionInfo") | Out-Null

$serverName = "localhost\MSSQLSERVER01"
$dbName = "depi"
$outputFile = "c:\Users\ab163\OneDrive\Documenti\depi-project\depi-project\backend\database\full_database_export.sql"

if (Test-Path $outputFile) { Remove-Item $outputFile }

# Setup connection
$sqlConn = New-Object System.Data.SqlClient.SqlConnection("Server=$serverName;Database=$dbName;User Id=sa;Password=123456;TrustServerCertificate=True;")
$conn = New-Object Microsoft.SqlServer.Management.Common.ServerConnection($sqlConn)
$srv = New-Object Microsoft.SqlServer.Management.Smo.Server($conn)

$db = $srv.Databases[$dbName]

if ($null -eq $db) {
    Write-Error "Database $dbName not found."
    exit 1
}

# Use Scripter
$scripter = New-Object Microsoft.SqlServer.Management.Smo.Scripter($srv)
$scripter.Options.ScriptSchema = $true
$scripter.Options.ScriptData = $false
$scripter.Options.WithDependencies = $true
$scripter.Options.Indexes = $true
$scripter.Options.DriAll = $true
$scripter.Options.Triggers = $true
$scripter.Options.IncludeHeaders = $true
$scripter.Options.ScriptBatchTerminator = $true
$scripter.Options.ToFileOnly = $true
$scripter.Options.FileName = $outputFile
$scripter.Options.AppendToFile = $true

# Get all non-system objects
$tables = $db.Tables | Where-Object { $_.IsSystemObject -eq $false }
$views = $db.Views | Where-Object { $_.IsSystemObject -eq $false }
$sps = $db.StoredProcedures | Where-Object { $_.IsSystemObject -eq $false }

$allObjects = @()
$allObjects += $tables
$allObjects += $views
$allObjects += $sps

Write-Host "Scripting Schema..."
# Create a dependency tree to script in correct order
$urns = New-Object Microsoft.SqlServer.Management.Smo.UrnCollection
foreach ($obj in $allObjects) {
    $urns.Add($obj.Urn)
}

$scripter.Script($urns)

# Now script data for tables
Write-Host "Scripting Data..."
$dataScripter = New-Object Microsoft.SqlServer.Management.Smo.Scripter($srv)
$dataScripter.Options.ScriptSchema = $false
$dataScripter.Options.ScriptData = $true
$dataScripter.Options.ToFileOnly = $true
$dataScripter.Options.FileName = $outputFile
$dataScripter.Options.AppendToFile = $true

$tableUrns = New-Object Microsoft.SqlServer.Management.Smo.UrnCollection
foreach ($tbl in $tables) {
    $tableUrns.Add($tbl.Urn)
}
$dataScripter.EnumScript($tableUrns)

Write-Host "Done."
