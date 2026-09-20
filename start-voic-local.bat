@echo off
title VOIC - Local AI Launcher
color 0A

echo ======================================================================
echo             VOIC : Autonomous AI Speaking & Interview Coach
echo                      Local AI Environment Launcher
echo ======================================================================
echo.

:: 1. Periksa Service Ollama Lokal
echo [1/3] Memeriksa status service Ollama lokal...
powershell -NoProfile -Command "$res = try { (Invoke-WebRequest -Uri 'http://127.0.0.1:11434/api/tags' -TimeoutSec 2 -UseBasicParsing).StatusCode } catch { 0 }; if ($res -ne 200) { Start-Process -FilePath '%LOCALAPPDATA%\Programs\Ollama\ollama.exe' -ArgumentList 'serve' -WindowStyle Hidden; Write-Host '  -> Menyalakan Ollama serve di latar belakang...' } else { Write-Host '  -> Ollama sudah aktif di port 11434 (Siap).' }"

:: Tunggu 2 detik untuk memastikan port siap
timeout /t 2 /nobreak >nul

:: 2. Periksa Model voic-qwen
echo [2/3] Memverifikasi model VOIC Qwen...
powershell -NoProfile -Command "$models = try { (Invoke-RestMethod -Uri 'http://127.0.0.1:11434/api/tags').models.name } catch { @() }; if ($models -contains 'voic-qwen:latest' -or $models -contains 'voic-qwen') { Write-Host '  -> Model voic-qwen aktif.' } else { Write-Host '  -> Membuat model voic-qwen dari Modelfile...'; & '%LOCALAPPDATA%\Programs\Ollama\ollama.exe' create voic-qwen -f Modelfile }"

:: 3. Jalankan Laravel dan Vite
echo [3/3] Menjalankan server aplikasi VOIC...
echo   -> Membuka peramban ke http://127.0.0.1:8000
start "" "http://127.0.0.1:8000"

echo.
echo ======================================================================
echo Service VOIC & AI Lokal sedang berjalan.
echo Tekan CTRL+C di jendela ini jika ingin menghentikan dev server.
echo ======================================================================
echo.

call npm run dev & php artisan serve --port=8000
