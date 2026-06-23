$sqlConn = New-Object System.Data.SqlClient.SqlConnection("Server=localhost\MSSQLSERVER01;Database=depi;User Id=sa;Password=123456;TrustServerCertificate=True;")
$sqlConn.Open()
$cmd = $sqlConn.CreateCommand()
$cmd.CommandText = Get-Content -Path "c:\Users\ab163\OneDrive\Documenti\depi-project\depi-project\backend\database\alter_view.sql" -Raw
$cmd.ExecuteNonQuery()
$sqlConn.Close()
Write-Host "Success"
