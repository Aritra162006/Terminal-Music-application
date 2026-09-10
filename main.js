const path = require('path');
const UI = require('./ui');
const audio = require('./audio');

async function main() {
    const ui = new UI();
    const musicDir = path.join(__dirname, 'music');
    await ui.loadMusic(musicDir);
    
    let playingIndex = -1;

    function playSong(index) {
        if (ui.tracks.length === 0) return;
        
        // Wrap around logic
        if (index < 0) index = ui.tracks.length - 1;
        if (index >= ui.tracks.length) index = 0;
        
        playingIndex = index;
        const track = ui.tracks[playingIndex];
        
        audio.play(track.path);
        ui.setNowPlaying(track.title, track.artist);
        ui.songList.select(playingIndex);
        isPaused = false;
        ui.screen.render();
    }
    
    // Play selected song on Enter
    ui.songList.on('select', (item, index) => {
        playSong(index);
    });

    let isPaused = false;

    ui.screen.key(['space'], () => {
        if (playingIndex === -1) return;
        audio.pause();
        isPaused = !isPaused;
        ui.setPaused(isPaused);
    });

    ui.screen.key(['n'], () => {
        if (playingIndex !== -1) playSong(playingIndex + 1);
        else playSong(0);
    });

    ui.screen.key(['p'], () => {
        if (playingIndex !== -1) playSong(playingIndex - 1);
        else playSong(0);
    });

    ui.screen.key(['right'], () => {
        audio.seekForward(10);
    });

    ui.screen.key(['left'], () => {
        audio.seekBackward(10);
    });

    audio.on('time', (elapsed) => {
        if (playingIndex !== -1) {
            const track = ui.tracks[playingIndex];
            ui.updateProgress(elapsed, track.duration);
        }
    });

    audio.on('end', () => {
        if (playingIndex !== -1) {
            playSong(playingIndex + 1);
        }
    });

    ui.songList.focus();
}

main();
