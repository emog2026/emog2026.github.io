@echo off
REM 新文章生成脚本 - Windows版本
REM 使用方法: new_post.bat "文章标题"

if "%~1"=="" (
    echo 请提供文章标题
    echo 使用方法: new_post.bat "文章标题"
    exit /b 1
)

set TITLE=%~1
set DATE=%date:~0,4%-%date:~5,2%-%date:~8,2%
REM 将标题中的空格替换为短横线
set FILENAME=%DATE%-%TITLE: =%.md
set POST_PATH=_posts\%FILENAME%

REM 检查文件是否已存在
if exist "%POST_PATH%" (
    echo 错误: 文章已存在 - %POST_PATH%
    exit /b 1
)

REM 创建文章文件
(
echo ---
echo layout: post
echo title: "%TITLE%"
echo date: %DATE%
echo tags: []
echo ---
echo.
) > "%POST_PATH%"

echo ✓ 新文章已创建: %POST_PATH%
echo 请编辑文章内容