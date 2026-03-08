# TopRanker Audio Assets

Audio files for the branded sound system. Each file should be a short, warm, premium-sounding effect.

## Required Files

| File | Duration | Trigger | Status |
|------|----------|---------|--------|
| `splash-chime.mp3` | ~1s | App splash screen logo reveal | Pending |
| `rating-success.mp3` | ~0.5s | Rating submitted successfully | Pending |
| `tier-upgrade.mp3` | ~1.2s | Member credibility tier promotion | Pending |
| `winner-reveal.mp3` | ~1.5s | Challenger winner announcement | Pending |
| `confetti-pop.mp3` | ~0.8s | Celebration moments (badge earned, etc.) | Pending |

## Sound Design Guidelines

- Warm, organic tones (not synthetic/gamified)
- Match brand personality: trustworthy, premium, community-driven
- Respect iOS silent switch (`playsInSilentModeIOS: false`)
- Volume normalized to -14 LUFS for consistent playback
- Format: MP3 or M4A, 44.1kHz, mono

## Integration

Once audio files are placed here, uncomment the `SOUNDS` object and combined
audio+haptic triggers in `lib/audio.ts` (lines 189-202).
