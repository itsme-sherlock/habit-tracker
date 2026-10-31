# Habit Tracker MCP Server

Model Context Protocol (MCP) server for the Habit Tracker PWA.

## Features

- Habit management tools
- Task management tools
- Completion tracking
- Statistics and analytics

## Installation

```bash
pip install -e .
```

## Usage

```bash
# Run with stdio transport (for local AI agents)
python -m habit_mcp

# Run with HTTP transport
python -m habit_mcp --transport http --port 8000

# Run with SSE transport
python -m habit_mcp --transport sse --port 8000
```

## Tools

- `habit_*` - Habit CRUD operations
- `task_*` - Study task management
- `completion_*` - Daily completion tracking
- `stats_*` - Statistics and analytics