@echo off
REM Windows用のmakeコマンドラッパー
REM .\make <command> の形式で実行可能

powershell -ExecutionPolicy Bypass -File "%~dp0make.ps1" %*

