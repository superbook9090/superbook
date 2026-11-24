---
name: faceless-video
description: End-to-end autonomous skill for creating viral faceless short-form videos (YouTube Shorts, Instagram Reels, TikTok) and long-form explainers. Handles hook-first scriptwriting, asset generation, kinetic subtitles with highlight markers, timeline assembly, and multi-platform publishing.
risk: safe
source: local
date_added: "2026-11-12"
---

# Faceless Video Producer Skill

## 🎯 When to Use
- You want to generate viral, automated faceless videos from a topic, blog post, article, or prompt.
- Creating 9:16 vertical videos for YouTube Shorts, Instagram Reels, or TikTok.
- Creating 16:9 explainer videos or educational walkthroughs.
- Orchestrating scriptwriting, scene pacing, AI image generation, stock media selection, burned-in kinetic subtitles, and timeline rendering.
- Publishing or scheduling videos directly to YouTube, TikTok, or Instagram.

---

## 🏗️ The 6-Stage Faceless Video Pipeline

```
[1. Hook & Script] ➔ [2. Storyboard Plan] ➔ [3. Asset Generation] ➔ [4. Captions & Timing] ➔ [5. Timeline & Render] ➔ [6. Distribute]
```

### Stage 1: The High-Retention Script (Viral Blueprint)
Faceless videos win or lose in the first **3 seconds**. Every script must adhere to the 4-part retention structure:

1. **The Pattern Interrupt Hook (0–3s):**
   - Shocking statement, counter-intuitive fact, or urgent question.
   - *Example:* "Stop learning Python the wrong way in 2026." or "This Roman emperor was assassinated in the most bizarre way possible."
2. **The Stakes / Agitation (3–10s):**
   - Why the viewer should care right now. Heighten the curiosity gap.
3. **The Core Delivery (10–45s):**
   - 3 to 4 punchy, high-value points delivered sequentially.
   - Pacing: 120–150 words per minute. Cut all fluff, filler words, and slow greetings.
4. **The Rewatch Loop / Call to Action (45–60s):**
   - Seamless loop back into the hook or a clean 2-second CTA ("Save this for later", "Follow for part 2").

---

### Stage 2: Storyboard Planning (`video_plan_from_story`)
Use `video_plan_from_story` to structure the script into discrete scenes with visual directions:

```json
{
  "projectDir": "/absolute/path/to/project_dir",
  "title": "5_mindblowing_facts_about_space",
  "story": "<Full script text>",
  "aspectRatio": "9:16",
  "targetDurationSec": 45,
  "language": "en",
  "style": "Cinematic dark moody sci-fi with neon volumetric lighting, hyper-realistic 8k"
}
```

**Pacing Standard:**
- Cut or change visual asset every **2.0 to 3.2 seconds**.
- For a 30s video: 10–12 scenes.
- For a 60s video: 18–22 scenes.

---

### Stage 3: Asset Orchestration (Visuals & Audio)
For each scene planned:
1. **AI Image Generation:** Call `video_generate_image` using descriptive, style-consistent prompts. Keep color palette and atmospheric tone consistent across all scenes.
2. **Stock Footage/B-Roll:** Call `video_search_stock_assets` and `video_download_stock_assets` for realistic textures, drone footage, or archival imagery.
3. **Background Music:** Choose low-tempo instrumental or phonk/lo-fi depending on genre. Keep volume low (-18dB relative to voiceover) so narration is crystal clear.

---

### Stage 4: Kinetic Typography & Caption Styling
Captions are essential — over 70% of mobile users watch vertical videos on mute or with subtitles.

**Caption Formatting Rules (`video_build_timeline`):**
- **Word Chunking:** 3 to 5 words maximum per display line. Never wrap into 3+ lines.
- **Single-Word Highlight:** Emphasize the punchline or keyword using `**word**` markdown.
- **Color Palettes:**
  - Standard Viral: White text (`#FFFFFF`) with thick black outline (`#000000`) and Yellow highlight (`#FFD400`).
  - Tech / Futuristic: White text with Cyan/Neon Green highlight (`#00FF66`).
  - Finance / Crime: Off-white text with Gold highlight (`#FFC800`) or Blood Red (`#FF3B30`).
- **UI Safe Zone:**
  - Set `position: "lower-middle"` to avoid the bottom overlay (sound info, account title) and right-side action buttons (like, comment, share).
  - Target height: ~35%–45% from the bottom of the screen.

---

### Stage 5: Timeline Assembly & Rendering

Assemble the timeline using `video_build_timeline`:
```json
{
  "projectDir": "/absolute/path/to/project_dir",
  "captionStyle": {
    "preset": "shorts",
    "fontSizePx": 80,
    "highlightColor": "#FFD400",
    "position": "lower-middle"
  },
  "scenes": [
    {
      "id": "scene_01",
      "assetId": "asset_hook_img",
      "durationSec": 2.8,
      "narration": "Most people think the pyramids were built by slaves.",
      "onScreenText": "Most people think the **pyramids**\\nwere built by slaves."
    }
  ]
}
```

Trigger the render with `video_render`:
```json
{
  "projectDir": "/absolute/path/to/project_dir",
  "outputFileName": "final_shorts.mp4",
  "confirm": true
}
```
Check progress with `video_job_status`.

---

### Stage 6: Multi-Platform Publishing & SEO
Once the video is rendered and verified (`video_validate`):
1. **YouTube Shorts:** Call `youtube_upload_video` or `youtube_schedule_video` with:
   - High-CTR title with `#Shorts` included.
   - 3–5 targeted hashtags in description.
   - Pinned comment to drive engagement.
2. **TikTok:** Plan and schedule via `tiktok_business_plan_video_post` / `tiktok_business_publish_video`.
3. **Instagram Reels:** Distribute via `instagram_post_video`.

---

## 🎨 Popular Content Archetypes & Templates

### 1. "Did You Know?" / Dark History / Curiosities
- **Pacing:** Very fast (2s scene changes).
- **Style:** Gritty oil painting, dramatic chiaroscuro, cinematic historical reenactment.
- **Sound:** Ambient mystery drone + deep bass drops on key reveals.

### 2. Tech / Coding / Future Tools
- **Pacing:** Fast & crisp (2.5s scene changes).
- **Style:** Clean dark-mode glassmorphic 3D isometric, glowing neon vectors, code terminal screenshots.
- **Sound:** Lofi hip hop or modern upbeat synth.

### 3. Stoic / Motivational / Philosophy
- **Pacing:** Measured and authoritative (3.5s scene changes).
- **Style:** Marble statues, storm clouds, monochrome architecture with golden accents.
- **Sound:** Deep cinematic brass, orchestral swell.

---

## 🛡️ Best Practices & Quality Checklist
- [ ] Is the hook under 4 seconds with zero intro fluff?
- [ ] Are captions positioned in the safe zone (`lower-middle`)?
- [ ] Are scene lengths between 2.0s and 3.5s to prevent viewer drop-off?
- [ ] Does every subtitle line contain no more than 5 words?
- [ ] Is the final output aspect ratio `9:16` (1080x1920) for Shorts/Reels or `16:9` (1920x1080) for YouTube?
