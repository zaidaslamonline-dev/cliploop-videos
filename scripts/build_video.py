import argparse
import asyncio
import glob
import json
import os
import re
import subprocess
import shutil
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


def format_srt_time(seconds: float) -> str:
    ms = max(int(round(seconds * 1000)), 0)
    h, rem = divmod(ms, 3_600_000)
    m, rem = divmod(rem, 60_000)
    sec, milli = divmod(rem, 1000)
    return f"{h:02d}:{m:02d}:{sec:02d},{milli:03d}"


def build_srt_subtitles(raw_text: str, word_events: list, srt_path: str, total_duration: float):
    words = re.findall(r"\S+", raw_text)
    if not word_events:
        step = total_duration / max(len(words), 1)
        word_events = [{"word": w, "start": i * step, "end": (i + 1) * step} for i, w in enumerate(words)]

    n = min(len(words), len(word_events))
    aligned = [
        {"word": words[i], "start": word_events[i]["start"], "end": word_events[i]["end"]}
        for i in range(n)
    ]
    if len(words) > n:
        last_end = aligned[-1]["end"] if aligned else 0.0
        remaining = words[n:]
        step = max((total_duration - last_end) / len(remaining), 0.15)
        for i, word in enumerate(remaining):
            aligned.append({"word": word, "start": last_end + i * step, "end": last_end + (i + 1) * step})

    cues = []
    group_size = 5
    for i in range(0, len(aligned), group_size):
        group = aligned[i:i + group_size]
        start = group[0]["start"]
        end = max(group[-1]["end"], start + 0.25)
        cues.extend([
            str(len(cues) + 1),
            f"{format_srt_time(start)} --> {format_srt_time(end)}",
            " ".join(x["word"] for x in group),
            ""
        ])
    Path(srt_path).parent.mkdir(parents=True, exist_ok=True)
    Path(srt_path).write_text("\n".join(cues), encoding="utf-8")


def read_srt_word_events(srt_path: str):
    path = Path(srt_path)
    if not path.exists():
        return []
    content = path.read_text(encoding="utf-8-sig").strip()
    events = []
    for block in re.split(r"\n\s*\n", content):
        lines = [line.strip() for line in block.splitlines() if line.strip()]
        timing = next((line for line in lines if "-->" in line), None)
        if not timing:
            continue
        text_lines = lines[lines.index(timing) + 1:]
        words = re.findall(r"\S+", " ".join(text_lines))
        try:
            left, right = timing.split("-->")
            def parse_time(value):
                hh, mm, rest = value.strip().replace(",", ".").split(":")
                return int(hh) * 3600 + int(mm) * 60 + float(rest)
            start, end = parse_time(left), parse_time(right)
        except (ValueError, IndexError):
            continue
        if not words:
            continue
        step = max((end - start) / len(words), 0.08)
        for i, word in enumerate(words):
            events.append({"word": word, "start": start + i * step, "end": start + (i + 1) * step})
    return events


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


def render_episode(episode_dir: str, output_dir: str, voiceover_only: bool = False):
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

    audio_dir = ep_path / "audio"
    audio_dir.mkdir(parents=True, exist_ok=True)
    approved_voiceover = audio_dir / "voiceover.mp3"
    saved_srt = audio_dir / "captions.srt"
    clean_voice = str(work_dir / "voice_clean.wav")

    if approved_voiceover.exists() and config.get("voiceover_approved", False):
        print(f"Reusing approved voiceover: {approved_voiceover}")
        subprocess.run([
            "ffmpeg", "-y", "-i", str(approved_voiceover),
            "-af", "loudnorm=I=-14:TP=-1.5:LRA=11",
            clean_voice
        ], check=True)
        word_events = read_srt_word_events(str(saved_srt))
    else:
        raw_voice = str(work_dir / "voice_raw.mp3")
        word_events = asyncio.run(generate_tts_and_boundaries(raw_text, raw_voice, voice=config["voice"]))
        subprocess.run([
            "ffmpeg", "-y", "-i", raw_voice,
            "-af", "loudnorm=I=-14:TP=-1.5:LRA=11",
            clean_voice
        ], check=True)
        duration_for_srt = get_audio_duration(clean_voice)
        build_srt_subtitles(raw_text, word_events, str(saved_srt), duration_for_srt)
        subprocess.run([
            "ffmpeg", "-y", "-i", clean_voice,
            "-codec:a", "libmp3lame", "-b:a", "192k", str(approved_voiceover)
        ], check=True)
        print(f"Generated and saved voiceover: {approved_voiceover}")
        print(f"Generated and saved subtitles: {saved_srt}")

    duration = get_audio_duration(clean_voice) + 0.5
    if not saved_srt.exists():
        build_srt_subtitles(raw_text, word_events, str(saved_srt), duration - 0.5)

    if voiceover_only:
        preview_mp3 = out_path / f"ep-{ep_num}-voiceover.mp3"
        shutil.copy2(approved_voiceover, preview_mp3)
        print(f"Voiceover asset ready: {approved_voiceover}")
        print(f"Subtitle asset ready: {saved_srt}")
        print(f"Preview copy ready: {preview_mp3}")
        return

    ass_path = str(work_dir / "subtitles.ass")
    if not word_events:
        word_events = read_srt_word_events(str(saved_srt))
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
    whoosh_path = Path("assets/sfx/whoosh.mp3")

    has_bgm = bgm_path.exists()
    has_particles = particles_path.exists()
    has_bass = bass_path.exists()
    has_whoosh = whoosh_path.exists()

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
    if has_whoosh and len(images) > 1:
        inputs.extend(["-i", str(whoosh_path)])
        whoosh_idx = next_idx
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
    if has_whoosh and len(images) > 1:
        transition_count = len(images) - 1
        split_labels = "".join(f"[whsrc{i}]" for i in range(transition_count))
        a_chain += f"[{whoosh_idx}:a]asplit={transition_count}{split_labels};"
        for i in range(transition_count):
            delay_ms = int(round(scene_dur * (i + 1) * 1000))
            a_chain += f"[whsrc{i}]adelay={delay_ms}|{delay_ms},volume=0.24[whoosh{i}];"
            a_inputs.append(f"[whoosh{i}]")

    if len(a_inputs) > 1:
        a_chain += f"{''.join(a_inputs)}amix=inputs={len(a_inputs)}:duration=first:dropout_transition=2:normalize=0,alimiter=limit=0.95[aout]"
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
    parser.add_argument("--voiceover-only", action="store_true", help="Generate and export narration MP3 without requiring images")
    args = parser.parse_args()
    render_episode(os.path.join("episodes", args.episode), args.output, voiceover_only=args.voiceover_only)