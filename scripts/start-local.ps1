param([switch]$CheckOnly, [ValidateSet('', 'frontend', 'backend')][string]$Service = '')
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$toolRoot = Join-Path $env:USERPROFILE '.cache/ranbank-tools'
$nodeCandidates = @((Get-Command node -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source), (Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'))
$nodePath = $nodeCandidates | Where-Object { $_ -and (Test-Path -LiteralPath $_) } | Select-Object -First 1
if (!$nodePath) { throw 'Instale Node.js 22.13 ou superior para iniciar o frontend.' }
$nodeVersion = & $nodePath -p 'process.versions.node'
if ([version]$nodeVersion -lt [version]'22.13.0') { throw "Node $nodeVersion incompatível. Use Node.js 22.13 ou superior." }
$jdkCandidates = @($env:JAVA_HOME, (Join-Path $toolRoot 'jdk-21'))
$jdkPath = $jdkCandidates | Where-Object { $_ -and (Test-Path -LiteralPath (Join-Path $_ 'bin/javac.exe')) -and ((Get-Content -LiteralPath (Join-Path $_ 'release') -ErrorAction SilentlyContinue) -match 'JAVA_VERSION="21\.') } | Select-Object -First 1
if (!$jdkPath) { throw 'Configure JAVA_HOME para um JDK 21 (o Java 8 não é compatível).' }
$env:JAVA_HOME = $jdkPath
$env:Path = "$jdkPath/bin;$env:Path"
$mavenCandidates = @((Get-Command mvn -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source), (Join-Path $toolRoot 'apache-maven-3.9.11/bin/mvn.cmd'))
$mavenPath = $mavenCandidates | Where-Object { $_ -and (Test-Path -LiteralPath $_) } | Select-Object -First 1
if (!$mavenPath) { throw 'Instale o Maven e coloque seu diretório bin no Path.' }
$frontendCli = Join-Path $projectRoot 'node_modules/vinext/dist/cli.js'
if (!(Test-Path -LiteralPath $frontendCli)) { throw 'Faltam dependências. Execute npm ci na raiz do projeto.' }
if ($CheckOnly) { Write-Output "Pronto: Node $nodeVersion, JDK 21, Maven e dependências encontrados."; exit 0 }
if ($Service -eq 'frontend') { Set-Location -LiteralPath $projectRoot; & $nodePath $frontendCli dev; exit $LASTEXITCODE }
if ($Service -eq 'backend') { Set-Location -LiteralPath (Join-Path $projectRoot 'backend'); & $mavenPath -B '-Dmaven.repo.local=../.m2/repository' spring-boot:run; exit $LASTEXITCODE }
$runtimeDir = Join-Path $projectRoot '.runtime'
New-Item -ItemType Directory -Path $runtimeDir -Force | Out-Null
function Test-Ready([string]$Url) { try { return (Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 2).StatusCode -eq 200 } catch { return $false } }
$targets = @(@{ Name='backend'; Port=8080; Url='http://localhost:8080/api/health' }, @{ Name='frontend'; Port=3000; Url='http://localhost:3000/banco' })
foreach ($target in $targets) {
  if (Test-Ready $target.Url) { Write-Output "$($target.Name) já está online."; continue }
  if (Get-NetTCPConnection -LocalPort $target.Port -State Listen -ErrorAction SilentlyContinue) { throw "Porta $($target.Port) ocupada por um serviço que não respondeu. Verifique antes de iniciar outra instância." }
  $child = Start-Process powershell -WindowStyle Hidden -PassThru -ArgumentList @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', "`"$PSCommandPath`"", '-Service', $target.Name) -RedirectStandardOutput (Join-Path $runtimeDir "$($target.Name).log") -RedirectStandardError (Join-Path $runtimeDir "$($target.Name).error.log")
  $child.Id | Set-Content -LiteralPath (Join-Path $runtimeDir "$($target.Name).pid")
  $until = (Get-Date).AddSeconds(90)
  while (!(Test-Ready $target.Url)) {
    if ($child.HasExited -or (Get-Date) -gt $until) { throw "Falha ao iniciar $($target.Name). Consulte .runtime/$($target.Name).log e .runtime/$($target.Name).error.log." }
    Start-Sleep -Seconds 1
  }
  Write-Output "$($target.Name) pronto."
}
Write-Output 'RanBank disponível em http://localhost:3000/banco'
