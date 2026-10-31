"""FastMCP server entry point for Habit Tracker MCP."""
from __future__ import annotations
import argparse
import os
from fastmcp import FastMCP

from .tools import (
    register_habit_tools,
    register_task_tools,
    register_completion_tools,
    register_stats_tools,
)


def create_server() -> FastMCP:
    """Create and configure the FastMCP server with all tools."""
    mcp = FastMCP("Habit Tracker MCP")

    # Register all tool modules
    register_habit_tools(mcp)
    register_task_tools(mcp)
    register_completion_tools(mcp)
    register_stats_tools(mcp)

    return mcp


def main():
    """Main entry point with CLI argument parsing."""
    parser = argparse.ArgumentParser(description="Habit Tracker MCP Server")
    parser.add_argument(
        "--transport",
        choices=["stdio", "http", "sse"],
        default="stdio",
        help="Transport protocol (default: stdio)"
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8000,
        help="Port for HTTP/SSE transport (default: 8000)"
    )
    parser.add_argument(
        "--host",
        default="0.0.0.0",
        help="Host for HTTP/SSE transport (default: 0.0.0.0)"
    )
    args = parser.parse_args()

    mcp = create_server()

    if args.transport == "stdio":
        mcp.run()
    elif args.transport == "http":
        mcp.run(transport="http", host=args.host, port=args.port)
    elif args.transport == "sse":
        mcp.run(transport="sse", host=args.host, port=args.port)


if __name__ == "__main__":
    main()