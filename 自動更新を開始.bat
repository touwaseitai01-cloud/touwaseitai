@echo off
chcp 65001 > nul
cd /d "%~dp0"
git remote set-url origin https://github.com/touwaseitai01-cloud/touwaseitai.git > nul
echo.
echo ===============================================================
echo  ✅ 東和盛泰サイト 自動デプロイ 起動中
echo ===============================================================
echo  ・このウィンドウは閉じずに置いておいてください
echo  ・ファイルを保存すると 5秒後に自動で GitHub にアップロードされます
echo  ・公開先： https://touwaseitai.com
echo  ・止めたいときは Ctrl+C
echo ===============================================================
echo.
node 自動更新.js
echo.
echo ⚠️  自動デプロイが停止しました。何かキーを押すと閉じます。
pause > nul
