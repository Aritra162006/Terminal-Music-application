const blessed = require('blessed');
const fs = require('fs');
const path = require('path');
const mm = require('music-metadata');

class UI {
    constructor() {
        this.screen = blessed.screen({
            smartCSR: true,
            title: 'Terminal Music Player'
        });

        this.header = blessed.box({
            top: 0,
            left: 'center',
            width: '100%',
            height: 3,
            content: '{center}🎵 TUNEBOX 🎵{/center}',
            tags: true,
            border: {
                type: 'line'
            },
            style: {
                border: { fg: 'cyan' },
                fg: 'white'
            }
        });

        this.nowPlaying = blessed.box({
            top: 3,
            left: 'center',
            width: '100%',
            height: 4,
            tags: true,
            border: { type: 'line' },
            style: {
                border: { fg: 'cyan' },
                fg: 'white'
            }
        });

        this.trackInfo = blessed.text({
            top: 0,
            left: 2,
            width: '100%-4',
            content: 'No track playing',
            tags: true
        });

        this.progressBar = blessed.progressbar({
            top: 1,
            left: 2,
            width: '100%-6',
            height: 1,
            orientation: 'horizontal',
            style: {
                bar: { bg: 'magenta' },
                bg: 'black'
            },
            filled: 0
        });

        this.timeText = blessed.text({
            top: 1,
            right: 2,
            content: '0:00 / 0:00',
            style: { fg: 'white' }
        });

        this.nowPlaying.append(this.trackInfo);
        this.nowPlaying.append(this.progressBar);
        this.nowPlaying.append(this.timeText);

        this.songList = blessed.list({
            top: 7,
            left: 'center',
            width: '100%',
            height: '100%-7',
            items: [],
            keys: true,
            vi: true,
            mouse: true,
            border: { type: 'line' },
            style: {
                border: { fg: 'cyan' },
                selected: { bg: 'magenta', fg: 'white', bold: true },
                item: { fg: 'white' }
            }
        });

        this.screen.append(this.header);
        this.screen.append(this.nowPlaying);
        this.screen.append(this.songList);

        this.screen.key(['escape', 'q', 'C-c'], () => {
            return process.exit(0);
        });
        
        this.tracks = [];
    }

    async loadMusic(musicDir) {
        if (!fs.existsSync(musicDir)) return;
        const files = fs.readdirSync(musicDir);
        const supportedExts = ['.mp3', '.flac', '.ogg'];
        
        for (const file of files) {
            const ext = path.extname(file).toLowerCase();
            if (supportedExts.includes(ext)) {
                const filePath = path.join(musicDir, file);
                try {
                    const metadata = await mm.parseFile(filePath);
                    const title = metadata.common.title || file;
                    const artist = metadata.common.artist || 'Unknown Artist';
                    this.tracks.push({ title, artist, path: filePath, duration: metadata.format.duration });
                    this.songList.addItem(` ${title} - ${artist}`);
                } catch (err) {
                    // Ignore errors for unparseable files
                    this.tracks.push({ title: file, artist: 'Unknown Artist', path: filePath, duration: 0 });
                    this.songList.addItem(` ${file} - Unknown Artist`);
                }
            }
        }
        this.screen.render();
    }

    setNowPlaying(title, artist) {
        this.trackInfo.setContent(`▶ ${title} - ${artist}`);
        this.progressBar.setProgress(0);
        this.timeText.setContent('0:00 / 0:00');
        this.screen.render();
    }

    updateProgress(elapsed, total) {
        if (total > 0) {
            const percent = (elapsed / total) * 100;
            this.progressBar.setProgress(percent);
            this.timeText.setContent(`${this.formatTime(elapsed)} / ${this.formatTime(total)}`);
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
