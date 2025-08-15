@echo off
REM SaaS Multi-Service Windows Batch Wrapper
REM This batch file provides a simple interface to the PowerShell script

if "%1"=="" (
    powershell -ExecutionPolicy Bypass -File "%~dp0dev.ps1" help
) else (
    powershell -ExecutionPolicy Bypass -File "%~dp0dev.ps1" %*
)
