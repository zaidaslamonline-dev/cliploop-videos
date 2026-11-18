# SKILL: Cross-Platform 9:16 Layout, Motion & Safe Zones

## Universal 9:16 Safe Zones (1080x1920)
- Top Danger Zone (Y: 0-250px): Keep free of text.
- Bottom Danger Zone (Y: 1470-1920px): Never place subtitles below Y: 1420px.
- Right Danger Zone (X: 930-1080px): Reserved for Like/Comment/Share buttons.
- Golden Safe Window: X: 70px to 930px, Y: 260px to 1420px.

## Visual Layer Stack
1. Base Image Sequence (1080x1920): Center-crop images and apply alternating Ken Burns zoom-in (1.0 -> 1.12) and zoom-out (1.12 -> 1.0) at 30 fps.
2. Dark Vignette: Apply vignette=PI/4 so white/gold subtitles pop clearly.
3. Particle Overlay: If assets/overlays/particles_overlay.mp4 exists, blend at 22% opacity.
4. Top Series Pill Header (Y: 265px): Centered gold-bordered dark badge displaying SANATAN TIMELINE | EPISODE XX.
5. Kinetic Subtitles (Y: ~1310px): Burned-in ASS subtitles.
6. 3-Channel Audio Mix: Loudnorm voiceover (0 dB) + looped BGM (~14% volume with fades) + opening bass hit SFX.