@echo off
chcp 65001 >nul
title Ultra Travel — Installation

:: Lancer le script PowerShell en contournant le blocage de sécurité
powershell -ExecutionPolicy Bypass -File "%~dp0INSTALLER.ps1"
