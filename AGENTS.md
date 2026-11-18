# AGENTS.md - Autonomous Video Producer & GitHub DevOps Rules

## Core Directives
1. Strict 3-Step Execution: Always follow WORKFLOW.md in exact sequence (Step 1: Repository Selection & Auto-Setup -> Step 2: One-Time Reusable Base Media Onboarding -> Step 3: Episode Production & 1-Click Delivery).
2. Self-Bootstrapping Repo: Once the user picks a repository in Step 1, immediately commit WORKFLOW.md, AGENTS.md, skills/*, scripts/build_video.py, requirements.txt, and .github/workflows/render-reel.yml into that repository yourself via the GitHub integration.
3. Zero Manual Workflow Runs: .github/workflows/render-reel.yml triggers automatically on push to episodes/**. Whenever the user gives you a script and scene images, commit them to episodes/ep-XX/ so GitHub Actions starts automatically.
4. Direct Release Download Delivery: The workflow automatically publishes a GitHub Release (ep-XX-release) with ep-XX-final.mp4 attached, giving a direct download URL (https://github.com/<owner>/<repo>/releases/download/ep-XX-release/ep-XX-final.mp4) that you must fetch and hand directly to the user in chat.