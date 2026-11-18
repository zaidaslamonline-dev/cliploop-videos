import argparse
import asyncio
import glob
import json
import os
import re
import subprocess
from pathlib import Path
import edge_tts

PRONUNCIATION_MAP = {
    "Hiranyagarbha": "Hiranya-garbha",
    "Swayambhuva": "Swayam-bhuva",
    "Shatarupa": "Shata-roopa",
    "Ardhanarishvara": "Ardha-naareesh-wara",
    "Brahma": "Brah-maa",
    "Kshirasagara": "Ksheera-saagara",
    "Sanatkumaras": "Sanat-kumaaras",
    "Vishwamitra": "Vishwaa-mitra",
}


def apply_pronunciation(text: str) -> str:
    out = text
    for k, v in PRONUNCIATION_MAP.items():
        out = re.sub(rf"\b{re.escape(k)}\b", v, out, flags=re.IGNORECASE)
    return out


def format_ass_time(seconds: float) -> str:
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = seconds % 60
    return f"{h}:{m:02d}:{s:05.2f}"


async def generate_tts_and_boundaries(raw_text: str, mp3_path: str, voice: str = "hi-IN-MadhurNeural", rate: str = "+6%"):
    tts_text = apply_pronunciation(raw_text)
    communicate = edge_tts.Communicate(tts_text, voice=voice, rate=rate)
    word_events = []
    with open(mp3_path, "wb") as f:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                start_sec = chunk["offset"] / 10_000_000.0
                dur_sec = chunk["duration"] / 10_000_000.0
                word_events.append({
                    "word": chunk["text"],
                    "start": start_sec,
                    "end": start_sec + dur_sec,
                })
    return word_events


def build_ass_subtitles(raw_text: str, word_events: list, ass_path: str, total_duration: float):
    display_words = re.findall(r"\S+", raw_text)
    if not word_events:
        step = total_duration / max(len(display_words), 1)
        word_events = [
            {"word": w, "start": i * step, "end": (i + 1) * step}
            for i, w in enumerate(display_words)
        ]

    aligned = []
    n = min(len(display_words), len(word_events))
    for i in range(n):
        aligned.append({
            "word": display_words[i],
            "start": word_events[i]["start"],
            "end": word_events[i]["end"],
        })
    if len(display_words) > n and aligned:
        last_end = aligned[-1]["end"]
        rem = display_words[n:]
        step = max((total_duration - last_end) / len(rem), 0.15)
        for j, w in enumerate(rem):
            aligned.append({
                "word": w,
                "start": last_end + j * step,
                "end": last_end + (j + 1) * step,
            })

    header = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,DejaVu Sans,66,&H00FFFFFF,&H0000D7FF,&H00000000,&H80000000,-1,0,0,0,100,100,1,0,1,4,2,2,80,80,610,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    lines = [header]
    chunk_size = 3
    for idx in range(0, len(aligned), chunk_size):
        chunk = aligned[idx : idx + chunk_size]
        for w_idx, active_w in enumerate(chunk):
            seg_start = active_w["start"]
            seg_end = chunk[w_idx + 1]["start"] if w_idx + 1 < len(chunk) else (
                aligned[idx + chunk_size]["start"] if idx + chunk_size < len(aligned) else active_w["end"] + 0.25
            )
            if seg_end <= seg_start:
                seg_end = seg_start + 0.12

            styled_tokens = []
            for k, token in enumerate(chunk):
                clean_tok = token["word"].upper()
                if k == w_idx:
                    styled_tokens.append(f"{{\\c&H0000D7FF&\\b1}}{clean_tok}{{\\c&H00FFFFFF&}}")
                else:
                    styled_tokens.append(clean_tok)
            dialogue_text = " ".join(styled_tokens)
            lines.append(
                f"Dialogue: 0,{format_ass_time(seg_start)},{format_ass_time(seg_end)},Default,,0,0,0,,{dialogue_text}\n"
            )

    with open(ass_path, "w", encoding="utf-8") as f:
        f.writelines(lines)


def get_audio_duration(path: str) -> float:
    cmd = [
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", path
    ]
    out = subprocess.check_output(cmd).decode().strip()
    return float(out)


def render_episode(episode_dir: str, output_dir: str):
    ep_path = Path(episode_dir)
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)
    work_dir = out_path / "work"
    work_dir.mkdir(parents=True, exist_ok=True)

    script_file = ep_path / "script.txt"
    if not script_file.exists():
        raise FileNotFoundError(f"Missing script file: {script_file}")

    raw_text = script_file.read_text(encoding="utf-8").strip()

    config = {"episode": ep_path.name.replace("ep-", ""), "series": "SANATAN TIMELINE", "voice": "hi-IN-MadhurNeural"}
    cfg_file = ep_path / "config.json"
    if cfg_file.exists():
        config.update(json.loads(cfg_file.read_text(encoding="utf-8")))

    ep_num = str(config.get("episode", "01")).zfill(2)
    series_title = str(config.get("series", "SANATAN TIMELINE")).upper()
    badge_text = f"{series_title}  |  EPISODE {ep_num}"

    raw_voice = str(work_dir / "voice_raw.mp3")
    clean_voice = str(work_dir / "voice_clean.wav")
    word_events = asyncio.run(generate_tts_and_boundaries(raw_text, raw_voice, voice=config["voice"]))

    subprocess.run([
        "ffmpeg", "-y", "-i", raw_voice,
        "-af", "loudnorm=I=-14:TP=-1.5:LRA=11",
        clean_voice
    ], check=True)

    duration = get_audio_duration(clean_voice) + 0.5

    ass_path = str(work_dir / "subtitles.ass")
    build_ass_subtitles(raw_text, word_events, ass_path, duration)

    img_patterns = ["*.png", "*.jpg", "*.jpeg", "*.webp"]
    images = []
    for pat in img_patterns:
        images.extend(glob.glob(str(ep_path / "images" / pat)))
    images = sorted(images)
    if not images:
        raise FileNotFoundError(f"No images found inside {ep_path / 'images'}")

    scene_dur = duration / len(images)
    fps = 30
    frames_per_scene = max(int(round(scene_dur * fps)), 30)

    scene_clips = []
    for idx, img in enumerate(images):
        clip_file = str(work_dir / f"scene_{idx:02d}.mp4")
        if idx % 2 == 0:
            zp = f"zoompan=z='min(zoom+0.0012,1.12)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={frames_per_scene}:s=1080x1920:fps={fps}"
        else:
            zp = f"zoompan=z='if(lte(zoom,1.0),1.12,max(1.001,zoom-0.0012))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={frames_per_scene}:s=1080x1920:fps={fps}"

        vf = f"scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,{zp},format=yuv420p"
        subprocess.run([
            "ffmpeg", "-y", "-loop", "1", "-i", img,
            "-vf", vf, "-t", f"{scene_dur:.3f}",
            "-c:v", "libx264", "-preset", "fast", "-crf", "20", clip_file
        ], check=True)
        scene_clips.append(clip_file)

    concat_txt = work_dir / "concat.txt"
    concat_txt.write_text("\n".join([f"file '{os.path.abspath(c)}'" for c in scene_clips]), encoding="utf-8")
    visual_track = str(work_dir / "visual_base.mp4")
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(concat_txt),
        "-c", "copy", visual_track
    ], check=True)

    inputs = ["-i", visual_track, "-i", clean_voice]
    bgm_path = Path("assets/bgm/bgm_main.mp3")
    particles_path = Path("assets/overlays/particles_overlay.mp4")
    bass_path = Path("assets/sfx/bass_hit.mp3")

    has_bgm = bgm_path.exists()
    has_particles = particles_path.exists()
    has_bass = bass_path.exists()

    next_idx = 2
    if has_particles:
        inputs.extend(["-stream_loop", "-1", "-i", str(particles_path)])
        part_idx = next_idx
        next_idx += 1
    if has_bgm:
        inputs.extend(["-stream_loop", "-1", "-i", str(bgm_path)])
        bgm_idx = next_idx
        next_idx += 1
    if has_bass:
        inputs.extend(["-i", str(bass_path)])
        bass_idx = next_idx
        next_idx += 1

    escaped_ass = ass_path.replace("\\", "/").replace(":", "\\:")
    escaped_badge = badge_text.replace(":", "\\:").replace("'", "")

    v_chain = "[0:v]vignette=PI/4[vig];"
    if has_particles:
        v_chain += f"[{part_idx}:v]scale=1080:1920,format=yuva420p,colorchannelmixer=aa=0.22[pt];[vig][pt]overlay=shortest=1[ov];"
        last_v = "[ov]"
    else:
        last_v = "[vig]"

    v_chain += (
        f"{last_v}drawbox=x=220:y=265:w=640:h=68:color=black@0.65:t=fill,"
        f"drawbox=x=220:y=265:w=640:h=68:color=0xFFD700@0.85:t=2,"
        f"drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:"
        f"text='{escaped_badge}':fontcolor=0xFFD700:fontsize=28:x=(w-text_w)/2:y=286,"
        f"ass='{escaped_ass}'[vout]"
    )

    a_inputs = ["[1:a]"]
    a_chain = ""
    if has_bgm:
        fade_out_start = max(duration - 1.5, 0.5)
        a_chain += f"[{bgm_idx}:a]volume=0.14,afade=t=in:st=0:d=1.2,afade=t=out:st={fade_out_start:.2f}:d=1.5[bgm];"
        a_inputs.append("[bgm]")
    if has_bass:
        a_chain += f"[{bass_idx}:a]volume=0.45[bass];"
        a_inputs.append("[bass]")

    if len(a_inputs) > 1:
        a_chain += f"{''.join(a_inputs)}amix=inputs={len(a_inputs)}:duration=first:dropout_transition=2[aout]"
    else:
        a_chain += "[1:a]anull[aout]"

    final_mp4 = str(out_path / f"ep-{ep_num}-final.mp4")
    cmd = [
        "ffmpeg", "-y", *inputs,
        "-filter_complex", f"{v_chain};{a_chain}",
        "-map", "[vout]", "-map", "[aout]",
        "-t", f"{duration:.3f}",
        "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k",
        final_mp4
    ]
    subprocess.run(cmd, check=True)
    print(f"Successfully rendered: {final_mp4}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--episode", required=True, help="Episode directory name e.g. ep-01")
    parser.add_argument("--output", default="dist", help="Output directory")
    args = parser.parse_args()
    render_episode(os.path.join("episodes", args.episode), args.output)