@echo off
chcp 65001 > nul
setlocal

echo.
echo ===============================================================
echo  東和盛泰サイト 自動デプロイを Windows ログイン時に自動起動するように設定します
echo ===============================================================
echo.

set "SRC=%~dp0自動更新を開始.bat"
set "STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "LNK=%STARTUP%\東和盛泰 自動デプロイ.lnk"

if not exist "%SRC%" (
  echo ❌ 「自動更新を開始.bat」が見つかりません: "%SRC%"
  pause
  exit /b 1
)

if not exist "%STARTUP%" (
  echo ❌ スタートアップフォルダが見つかりません: "%STARTUP%"
  pause
  exit /b 1
)

echo PowerShell でショートカットを作成しています...
powershell -NoProfile -Command ^
  "$s = (New-Object -ComObject WScript.Shell).CreateShortcut('%LNK%');" ^
  "$s.TargetPath = '%SRC%';" ^
  "$s.WorkingDirectory = '%~dp0';" ^
  "$s.WindowStyle = 7;" ^
  "$s.Description = '東和盛泰サイト 自動デプロイ（ファイル保存で自動 push）';" ^
  "$s.Save()"

if exist "%LNK%" (
  echo.
  echo ✅ 設定完了！
  echo    次回 Windows にログインした時から、自動デプロイが自動起動します。
  echo    （タスクバー右下の通知領域でウィンドウが小さくなって動きます）
  echo.
  echo 解除したいときは、以下を削除してください:
  echo    %LNK%
) else (
  echo ❌ ショートカットの作成に失敗しました
)

echo.
pause
endlocal
