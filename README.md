# 🎵 Terminal Music Player

A sleek, keyboard-driven music player that runs entirely in your terminal, built with Node.js and the `blessed` TUI library.

![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![Blessed](https://img.shields.io/badge/UI-Blessed-cyan.svg)
![Audio](https://img.shields.io/badge/Backend-mpg123-blue.svg)

## Features
- **Modern TUI**: Uses `blessed` for panels, lists, and progress bars.
- **Background Audio**: Uses `mpg123` in remote mode for seamless playback.
- **Live Timeline**: Parses stdout for accurate progress tracking and timestamps.
- **Zero GUI**: 100% terminal-based.

## Requirements

- Node.js 18+
- mpg123: `brew install mpg123` (macOS) or `sudo apt install mpg123` (Linux)

## Setup

```bash
npm install
```

Drop your `.mp3`, `.flac`, or `.ogg` files into the `music/` folder, then run:

```bash
npm start
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

## Architecture
- `main.js`: The controller handling application state (`playingIndex`) and wiring events.
- `ui.js`: The view layer built on `blessed`, responsible strictly for terminal drawing.
- `audio.js`: The audio backend, acting as an `EventEmitter` wrapper around `mpg123`.
