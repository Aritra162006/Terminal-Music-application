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
            content: '\n  No track playing',
            tags: true,
            border: { type: 'line' },
            style: {
                border: { fg: 'cyan' },
                fg: 'white'
            }
        });

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
        this.nowPlaying.setContent(`\n  ▶ ${title} - ${artist}`);
        this.screen.render();
    }
}

module.exports = UI;
