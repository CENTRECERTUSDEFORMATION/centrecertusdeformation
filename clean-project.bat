@echo off
title Nettoyage projet React / Vite

echo ===============================
echo Nettoyage du projet en cours...
echo ===============================

echo.
echo Suppression de node_modules...
rd /s /q node_modules 2>nul

echo Suppression du dossier dist...
rd /s /q dist 2>nul

echo Suppression du cache Vite...
rd /s /q node_modules\.vite 2>nul

echo Nettoyage du cache npm...
npm cache clean --force

echo.
echo Reinstallation des dependances...
npm install

echo.
echo Lancement du projet...
npm run dev

echo.
echo ===============================
echo Nettoyage termine !
echo ===============================
pause