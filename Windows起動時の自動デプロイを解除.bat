@echo off
chcp 65001 > nul

set "LNK=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\東和盛泰 自動デプロイ.lnk"

echo.
echo ===============================================================
echo  Windows ログイン時の自動デプロイ起動を解除します
echo ===============================================================
echo.

if exist "%LNK%" (
  del "%LNK%"
  echo ✅ 解除完了：ショートカットを削除しました
  echo    次回のログインからは自動起動しません
) else (
  echo ℹ️  既に解除済みです（ショートカットが存在しません）
)

echo.
pause
