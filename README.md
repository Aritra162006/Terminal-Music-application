# 🎵 Terminal Music Player

A keyboard-driven music player that runs entirely in your terminal.

## Requirements

- Node.js 18+
- mpg123: `brew install mpg123`

## Setup

```bash
npm install
```

Drop your `.mp3` / `.flac` / `.ogg` files into the `music/` folder, then:

```bash
node main.js
```

## Controls

| Key | Action |
|---|---|
| `↑` / `↓` | Navigate song list |
| `Enter` | Play selected song |
| `Space` | Pause / Resume |
| `→` | Skip forward 10s |
| `←` | Skip backward 10s |
| `n` | Next song |
| `p` | Previous song |
| `q` / `Ctrl+C` | Quit |
