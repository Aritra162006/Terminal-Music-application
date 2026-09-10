const { spawn } = require('child_process');

class AudioPlayer {
    constructor() {
        // Spawn mpg123 in remote control mode (-R)
        // -q for quiet (less console spam)
        this.process = spawn('mpg123', ['-R', '-q']);
        
        // Clean up when the main node process exits
        process.on('exit', () => {
            this.quit();
        });
    }

    play(filePath) {
        if (!this.process) return;
        // In mpg123 remote mode, 'load <file>' stops the current track and starts the new one
        this.process.stdin.write(`load ${filePath}\n`);
    }

    pause() {
        if (!this.process) return;
        // Sending 'pause' toggles play/pause state in mpg123
        this.process.stdin.write(`pause\n`);
    }

    quit() {
        if (this.process) {
            this.process.kill('SIGKILL');
            this.process = null;
        }
    }
}

module.exports = new AudioPlayer();
