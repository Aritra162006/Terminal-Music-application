const path = require('path');
const UI = require('./ui');

async function main() {
    const ui = new UI();
    const musicDir = path.join(__dirname, 'music');
    await ui.loadMusic(musicDir);
    ui.songList.focus();
}

main();
