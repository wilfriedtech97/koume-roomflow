// Builds a one-double-click installer file per platform that launches
// Koume RoomFlow in its own app window and creates a desktop icon.
const APP_URL = 'https://koumerf.base44.app';

export function detectPlatform() {
  if (typeof navigator === 'undefined') return 'windows';
  const ua = navigator.userAgent || '';
  if (/Android/i.test(ua)) return 'android';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Macintosh|Mac OS/i.test(ua)) return 'mac';
  if (/Linux|X11/i.test(ua)) return 'linux';
  if (/Windows/i.test(ua)) return 'windows';
  return 'windows';
}

const windowsLines = [
  '@echo off',
  `set "TARGET=${APP_URL}"`,
  'set "LAUNCHER="',
  'if exist "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" set "LAUNCHER=%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe"',
  'if not defined LAUNCHER if exist "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" set "LAUNCHER=%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe"',
  'if not defined LAUNCHER if exist "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" set "LAUNCHER=%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe"',
  'if not defined LAUNCHER if exist "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" set "LAUNCHER=%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe"',
  'if not defined LAUNCHER if exist "%LocalAppData%\\Google\\Chrome\\Application\\chrome.exe" set "LAUNCHER=%LocalAppData%\\Google\\Chrome\\Application\\chrome.exe"',
  'if not defined LAUNCHER if exist "%ProgramFiles%\\Chromium\\Application\\chrome.exe" set "LAUNCHER=%ProgramFiles%\\Chromium\\Application\\chrome.exe"',
  'if defined LAUNCHER (',
  '  start "" "%LAUNCHER%" --app=%TARGET%',
  `  powershell -NoProfile -Command "$w = New-Object -ComObject WScript.Shell; $d = [Environment]::GetFolderPath('Desktop'); $s = $w.CreateShortcut($d + '\\Koume RoomFlow.lnk'); $s.TargetPath = '%LAUNCHER%'; $s.Arguments = '--app=${APP_URL}'; $s.Save()"`,
  ') else (',
  `  start "" "${APP_URL}"`,
  `  powershell -NoProfile -Command "$w = New-Object -ComObject WScript.Shell; $d = [Environment]::GetFolderPath('Desktop'); $s = $w.CreateShortcut($d + '\\Koume RoomFlow.url'); $s.TargetPath = '${APP_URL}'; $s.Save()"`,
  ')',
  'exit',
];

const macLines = [
  '#!/bin/bash',
  '# Koume RoomFlow launcher',
  `URL="${APP_URL}"`,
  'CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"',
  'if [ -x "$CHROME" ]; then',
  '  "$CHROME" --app="$URL" >/dev/null 2>&1 &',
  'else',
  '  open "$URL"',
  'fi',
];

const linuxLines = [
  '[Desktop Entry]',
  'Version=1.0',
  'Type=Application',
  'Name=Koume RoomFlow',
  'Comment=Dormitory management system',
  `Exec=google-chrome --app=${APP_URL}`,
];

export function buildInstaller(platform) {
  if (platform === 'mac') {
    return { filename: 'KoumeRoomFlow-Installer.command', mime: 'application/octet-stream', content: macLines.join('\n') };
  }
  if (platform === 'linux') {
    return { filename: 'koume-roomflow-installer.desktop', mime: 'application/octet-stream', content: linuxLines.join('\n') };
  }
  if (platform === 'android' || platform === 'ios') return null;
  return { filename: 'KoumeRoomFlow-Installer.bat', mime: 'application/octet-stream', content: windowsLines.join('\r\n') };
}