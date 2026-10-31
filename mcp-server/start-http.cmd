@echo off
cd /d "%~dp0"
.venv\Scripts\python.exe -m src.habit_mcp.server --transport http --host 127.0.0.1 --port 8000
