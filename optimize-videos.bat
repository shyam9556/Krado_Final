@echo off
REM ============================================================
REM  VIDEO OPTIMIZATION SCRIPT FOR KRADO WEBSITE
REM  Requires: ffmpeg (https://ffmpeg.org/download.html)
REM  
REM  What this does:
REM  1. Re-encodes all MP4s to H.264 with web-optimized settings
REM  2. Adds faststart (moov atom at beginning) for instant playback
REM  3. Caps resolution at 720p (enough for card previews)
REM  4. Caps Work section videos at 960p (dashboard clarity)
REM  5. Reduces framerate to 30fps
REM  6. Uses CRF 28 (good quality, ~50%% smaller files)
REM ============================================================

set VIDEOS_DIR=public\videos
set TEMP_DIR=public\videos\_optimized

echo.
echo ========================================
echo  KRADO Video Optimization
echo ========================================
echo.

if not exist "%TEMP_DIR%" mkdir "%TEMP_DIR%"

echo [1/12] Optimizing marquee preview videos (720p cap)...
echo.

for %%f in (
    hero-asme-preview-B_nGDnTP
    hero-codenest-preview-Cgppc2qV
    hero-designpro-preview-D8c5_een
    hero-nexora-preview-cx5HmUgo
    hero-orbit-web3-preview-BXt4OttD
    hero-space-voyage-preview-eECLH3Yc
    hero-stellar-ai-preview-D3HL6bw1
    hero-stellar-ai-v2-preview-DjvxjG3C
    hero-vex-ventures-preview-BczMFIiw
    hero-xportfolio-preview-D4A8maiC
) do (
    echo   Processing %%f.mp4...
    ffmpeg -y -i "%VIDEOS_DIR%\%%f.mp4" ^
        -c:v libx264 -preset slow -crf 28 ^
        -vf "scale='min(1280,iw)':'min(720,ih)':force_original_aspect_ratio=decrease" ^
        -r 30 -an -pix_fmt yuv420p ^
        -movflags +faststart ^
        -profile:v high -level 4.1 ^
        "%TEMP_DIR%\%%f.mp4" 2>nul
    if errorlevel 1 (
        echo   ERROR: Failed %%f.mp4
    ) else (
        echo   OK: %%f.mp4
    )
)

echo.
echo [11/12] JivrajCapital.mp4 (960p, faststart fix)...
ffmpeg -y -i "%VIDEOS_DIR%\JivrajCapital.mp4" ^
    -c:v libx264 -preset slow -crf 26 ^
    -vf "scale='min(1920,iw)':'min(960,ih)':force_original_aspect_ratio=decrease" ^
    -r 30 -an -pix_fmt yuv420p ^
    -movflags +faststart ^
    -profile:v high -level 4.1 ^
    "%TEMP_DIR%\JivrajCapital.mp4" 2>nul
if errorlevel 1 (echo   ERROR) else (echo   OK)

echo.
echo [12/12] HRPL.mp4 (960p)...
ffmpeg -y -i "%VIDEOS_DIR%\HRPL.mp4" ^
    -c:v libx264 -preset slow -crf 26 ^
    -vf "scale='min(1920,iw)':'min(960,ih)':force_original_aspect_ratio=decrease" ^
    -r 30 -an -pix_fmt yuv420p ^
    -movflags +faststart ^
    -profile:v high -level 4.1 ^
    "%TEMP_DIR%\HRPL.mp4" 2>nul
if errorlevel 1 (echo   ERROR) else (echo   OK)

echo.
echo ========================================
echo  DONE - Review files in: %TEMP_DIR%
echo  To replace originals run:
echo    copy /Y "%TEMP_DIR%\*.mp4" "%VIDEOS_DIR%\"
echo ========================================
pause
