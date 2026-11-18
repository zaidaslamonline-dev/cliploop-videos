# MASTER AUTOPILOT VIDEO WORKFLOW (3-STEP PROTOCOL)

Read AGENTS.md and all files in skills/ before executing. Never skip steps or ask the user to perform manual GitHub actions.

## STEP 1: Repository Selection & Automatic Bootstrapping
1. Query the user's connected GitHub account and list their available repositories (or offer to create a new repository if they prefer).
2. Ask the exact question:
   "Here are your current repositories. Which one do you want me to use for this video pipeline?"
3. As soon as the user replies with a repository name:
   - Automatically commit all pipeline files from your sources into that repository:
     - AGENTS.md
     - WORKFLOW.md
     - requirements.txt
     - skills/SKILL_VOICE_AND_CAPTIONS.md
     - skills/SKILL_LAYOUT_AND_SAFEZONES.md
     - skills/SKILL_GITHUB_PIPELINE.md
     - scripts/build_video.py
     - .github/workflows/render-reel.yml
   - Create .gitkeep placeholders in assets/bgm/.gitkeep, assets/sfx/.gitkeep, assets/overlays/.gitkeep, and episodes/.gitkeep.
   - Proceed immediately to Step 2.

## STEP 2: One-Time Reusable Base Media Onboarding
1. Ask the user to upload/provide their frequently used base media layers once so they can be stored permanently in GitHub:
   - bgm_main.mp3 (Main Indian flute / mythological ambient background music)
   - whoosh.mp3 (Subtle transition sound effect between images)
   - bass_hit.mp3 (Opening hook impact sound)
   - particles_overlay.mp4 (Optional floating golden dust/embers loop on black background)
2. Always include these direct clickable links so the user can download free, royalty-free files immediately:
   - Mythological & Indian Flute BGM: https://pixabay.com/music/search/indian%20flute/ and https://pixabay.com/music/search/mythological/
   - Cinematic Whoosh & Bass Hit SFX: https://pixabay.com/sound-effects/search/cinematic%20whoosh/ and https://mixkit.co/free-sound-effects/whoosh/
   - Floating Dust/Embers Overlay: https://pixabay.com/videos/search/dust%20particles%20black%20background/
3. As soon as the user uploads any of these files in chat:
   - Commit them directly to assets/bgm/bgm_main.mp3, assets/sfx/whoosh.mp3, assets/sfx/bass_hit.mp3, and assets/overlays/particles_overlay.mp4 in the chosen repository.
   - Proceed immediately to Step 3.

## STEP 3: Pipeline Ready & Automated Video Creation
1. Confirm setup is complete by saying:
   "The pipeline is done! Let's create the first video. Send me the Episode number, script, and scene images (or tell me to write the script for you first)."
2. When the user provides the episode script and images:
   - Save the script to episodes/ep-XX/script.txt.
   - Save the images in order as episodes/ep-XX/images/01.png, 02.png, 03.png, etc.
   - Save metadata ({"episode": "01", "series": "SANATAN TIMELINE"}) to episodes/ep-XX/config.json.
   - Commit all files in a single commit so .github/workflows/render-reel.yml triggers automatically once.
3. Monitor the GitHub Action workflow run until it completes, verify the GitHub Release ep-XX-release, and reply with the direct 1-click download link to ep-XX-final.mp4 plus a ready-to-copy social caption and hashtags.