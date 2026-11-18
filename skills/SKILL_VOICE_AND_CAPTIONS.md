# SKILL: Edge-TTS Voiceover & Kinetic Hinglish Captions

## Voiceover Specifications
- Library: edge-tts (Python async API, zero API key required).
- Primary Voice: hi-IN-MadhurNeural (deep male storyteller) or en-IN-PrabhatNeural.
- Pacing: rate="+6%" for crisp short-form retention.
- Sanskrit Pronunciation Map (apply to TTS text only, keep accurate spelling in subtitles):
  - Hiranyagarbha -> Hiranya-garbha
  - Swayambhuva -> Swayam-bhuva
  - Shatarupa -> Shata-roopa
  - Ardhanarishvara -> Ardha-naareesh-wara
  - Brahma -> Brah-maa
  - Kshirasagara -> Ksheera-saagara

## Kinetic Subtitle Specifications (ASS Format)
- Capture WordBoundary events from edge-tts and group into 2 to 4 words per caption phrase.
- Canvas: PlayResX: 1080, PlayResY: 1920.
- Safe Zone Position: Alignment: 2, MarginV: 610 (sits at Y: ~1310px, safely above the bottom 450px UI zone).
- Style: DejaVu Sans Bold, 66px, Uppercase, White text (&H00FFFFFF) with Gold active-word highlight (&H0000D7FF) and 4px black outline.