@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title 二手交易平台 - 一键部署

echo.
echo ══════════════════════════════════════════
echo   二手交易平台 - 一键部署脚本
echo ══════════════════════════════════════════
echo.

:: 切换到脚本所在目录
cd /d "%~dp0"

:: ========== 1. 环境检查 ==========
echo [1/4] 检查环境...

:: 检查 Docker
docker info >nul 2>&1
if !errorlevel! neq 0 (
    echo   [错误] Docker 未运行，请先启动 Docker Desktop
    pause
    exit /b 1
)
echo   √ Docker 已运行

:: 检查 Node.js
node --version >nul 2>&1
if !errorlevel! neq 0 (
    echo   [错误] 未安装 Node.js，请先安装 Node.js
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do echo   √ Node.js %%i 已安装

:: ========== 2. 启动后端和数据库 ==========
echo.
echo [2/4] 启动后端和数据库 (Docker)...
echo   构建并启动容器 (首次运行需要几分钟)...
docker-compose up -d --build
if !errorlevel! neq 0 (
    echo   [错误] Docker 容器启动失败
    pause
    exit /b 1
)

:: 等待数据库就绪
echo   等待数据库就绪...
set count=0
:wait_db
set /a count+=1
if !count! gtr 30 (
    echo   [错误] 数据库启动超时
    pause
    exit /b 1
)
timeout /t 2 /nobreak >nul
docker-compose ps 2>nul | findstr "healthy" >nul 2>&1
if !errorlevel! neq 0 goto wait_db
echo   √ 数据库已就绪

:: 等待后端就绪
echo   等待后端服务启动...
set count=0
:wait_backend
set /a count+=1
if !count! gtr 60 (
    echo   [错误] 后端启动超时，请检查日志: docker-compose logs backend
    pause
    exit /b 1
)
timeout /t 3 /nobreak >nul
:: 使用 PowerShell 检查后端是否就绪
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:8080/api/products' -UseBasicParsing -TimeoutSec 2; exit 0 } catch { exit 1 }" >nul 2>&1
if !errorlevel! neq 0 goto wait_backend
echo   √ 后端服务已就绪

:: ========== 3. 前端部署 ==========
echo.
echo [3/4] 部署前端...
cd frontend

:: 检查是否需要安装依赖
if not exist "node_modules" (
    echo   安装前端依赖 (首次运行需要几分钟)...
    call npm install
    if !errorlevel! neq 0 (
        echo   [错误] 前端依赖安装失败
        cd ..
        pause
        exit /b 1
    )
    echo   √ 依赖安装完成
) else (
    echo   √ 依赖已存在，跳过安装
)

:: 在新窗口启动前端
echo   启动前端开发服务器...
start "二手交易平台 - 前端" cmd /k "npm run dev"

cd ..

:: ========== 4. 完成 ==========
echo.
echo [4/4] 部署完成！
echo.
echo ══════════════════════════════════════════
echo   访问地址:
echo   前端: http://localhost:3000
echo   后端: http://localhost:8080/api
echo ══════════════════════════════════════════
echo.
echo   提示:
echo   - 前端已在新窗口启动
echo   - 关闭此窗口不会停止服务
echo   - 停止所有服务: docker-compose down
echo.

:: 等待几秒后自动打开浏览器
echo 3秒后自动打开浏览器...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo 按任意键关闭此窗口...
pause >nul
