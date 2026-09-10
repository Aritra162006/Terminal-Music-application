const path = require('path');
const UI = require('./ui');
const audio = require('./audio');

async function main() {
    const ui = new UI();
    const musicDir = path.join(__dirname, 'music');
    await ui.loadMusic(musicDir);
    
    // Play selected song on Enter
    ui.songList.on('select', (item, index) => {
        const track = ui.tracks[index];
        if (track) {
            audio.play(track.path);
            ui.setNowPlaying(track.title, track.artist);
        }
    });

    ui.songList.focus();
}

main();
