# SKILL: Zero-Touch GitHub Actions Pipeline & Release Delivery

## Automatic Trigger
- Workflow: .github/workflows/render-reel.yml
- Triggers automatically on push to episodes/**.
- Detects the changed episode folder and runs python scripts/build_video.py --episode ep-XX.

## Direct 1-Click Delivery via GitHub Releases
- Uses softprops/action-gh-release@v2 to publish tag ep-XX-release with dist/ep-XX-final.mp4 attached.
- Agent Delivery Rule: Fetch the release asset URL (https://github.com/<owner>/<repo>/releases/download/ep-XX-release/ep-XX-final.mp4) and provide it directly to the user in chat.