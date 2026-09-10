const blessed = require('blessed');
const fs = require('fs');
const path = require('path');
const mm = require('music-metadata');

class UI {
    constructor() {
        this.screen = blessed.screen({
            smartCSR: true,
            title: 'TUNEBOX'
        });

        // ── Header ──
        this.header = blessed.box({
            top: 0,
            left: 'center',
            width: '100%',
            height: 3,
            content: '{center}{bold}♫  T U N E B O X  ♫{/bold}{/center}',
            tags: true,
            border: { type: 'line' },
            style: {
                border: { fg: 'magenta' },
                fg: 'cyan',
                bg: 'black'
            }
        });

        // ── Now Playing ──
        this.nowPlaying = blessed.box({
            top: 3,
            left: 0,
            width: '100%',
            height: 5,
            tags: true,
            border: { type: 'line' },
            label: ' Now Playing ',
            style: {
                border: { fg: 'magenta' },
                label: { fg: 'magenta', bold: true },
                fg: 'white',
                bg: 'black'
            }
        });

        this.trackInfo = blessed.text({
            top: 0,
            left: 1,
            width: '100%-4',
            content: '{gray-fg}No track playing{/gray-fg}',
            tags: true,
            style: { bg: 'black' }
        });

        // Progress bar — compact, just 1 row
        this.progressBar = blessed.progressbar({
            top: 1,
            left: 10,
            width: '100%-24',
            height: 1,
            orientation: 'horizontal',
            style: {
                bar: { bg: 'cyan' },
                bg: '#333333'
            },
            filled: 0
        });

        this.timeElapsed = blessed.text({
            top: 1,
            left: 1,
            width: 7,
            content: ' 0:00',
            style: { fg: 'cyan', bg: 'black' }
        });

        this.timeTotal = blessed.text({
            top: 1,
            right: 1,
            width: 7,
            content: '0:00 ',
            align: 'right',
            style: { fg: 'cyan', bg: 'black' }
        });

        // Status text (paused indicator)
        this.statusText = blessed.text({
            top: 2,
            left: 1,
            width: '100%-4',
            content: '',
            tags: true,
            style: { fg: 'yellow', bg: 'black' }
        });

        this.nowPlaying.append(this.trackInfo);
        this.nowPlaying.append(this.timeElapsed);
        this.nowPlaying.append(this.progressBar);
        this.nowPlaying.append(this.timeTotal);
        this.nowPlaying.append(this.statusText);

        // ── Song List ──
        this.songList = blessed.list({
            top: 8,
            left: 0,
            width: '100%',
            height: '100%-11',
            items: [],
            keys: true,
            vi: true,
            mouse: true,
            border: { type: 'line' },
            label: ' Playlist ',
            scrollbar: {
                ch: '│',
                style: { fg: 'cyan' }
            },
            style: {
                border: { fg: 'magenta' },
                label: { fg: 'magenta', bold: true },
                selected: { bg: 'cyan', fg: 'black', bold: true },
                item: { fg: 'white' },
                bg: 'black'
            }
        });

        // ── Controls Footer ──
        this.footer = blessed.box({
            bottom: 0,
            left: 0,
            width: '100%',
            height: 3,
            tags: true,
            border: { type: 'line' },
            content: '{center}{gray-fg}[Space]{/gray-fg} Pause  {gray-fg}[N]{/gray-fg} Next  {gray-fg}[P]{/gray-fg} Prev  {gray-fg}[←/→]{/gray-fg} Seek 10s  {gray-fg}[Enter]{/gray-fg} Play  {gray-fg}[Q]{/gray-fg} Quit{/center}',
            style: {
                border: { fg: 'magenta' },
                fg: 'white',
                bg: 'black'
            }
        });

        this.screen.append(this.header);
        this.screen.append(this.nowPlaying);
        this.screen.append(this.songList);
        this.screen.append(this.footer);

        this.screen.key(['escape', 'q', 'C-c'], () => {
            return process.exit(0);
        });
        
        this.tracks = [];
        this.paused = false;
    }

    async loadMusic(musicDir) {
        if (!fs.existsSync(musicDir)) return;
        const files = fs.readdirSync(musicDir);
        const supportedExts = ['.mp3', '.flac', '.ogg', '.wav'];
        
        for (const file of files) {
            const ext = path.extname(file).toLowerCase();
            if (supportedExts.includes(ext)) {
                const filePath = path.join(musicDir, file);
                try {
                    const metadata = await mm.parseFile(filePath);
                    const title = metadata.common.title || path.basename(file, ext);
                    const artist = metadata.common.artist || 'Unknown Artist';
                    const duration = metadata.format.duration || 0;
                    this.tracks.push({ title, artist, path: filePath, duration });
                    this.songList.addItem(`  ${this.formatTime(duration)}  │  ${title}  —  ${artist}`);
                } catch (err) {
                    this.tracks.push({ title: path.basename(file, ext), artist: 'Unknown Artist', path: filePath, duration: 0 });
                    this.songList.addItem(`  0:00  │  ${path.basename(file, ext)}  —  Unknown Artist`);
                }
            }
        }
        this.screen.render();
    }

    setNowPlaying(title, artist) {
        this.trackInfo.setContent(`{bold}${title}{/bold}  {gray-fg}—  ${artist}{/gray-fg}`);
        this.progressBar.setProgress(0);
        this.timeElapsed.setContent(' 0:00');
        this.timeTotal.setContent('0:00 ');
        this.paused = false;
        this.statusText.setContent('');
        this.screen.render();
    }

    setPaused(isPaused) {
        this.paused = isPaused;
        this.statusText.setContent(isPaused ? '{yellow-fg}⏸  PAUSED{/yellow-fg}' : '');
        this.screen.render();
    }

    updateProgress(elapsed, total) {
        if (total > 0) {
            const percent = (elapsed / total) * 100;
            this.progressBar.setProgress(percent);
            this.timeElapsed.setContent(` ${this.formatTime(elapsed)}`);
            this.timeTotal.setContent(`${this.formatTime(total)} `);
            this.screen.render();
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

module.exports = UI;
