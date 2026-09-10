const { spawn } = require('child_process');
const EventEmitter = require('events');

class AudioPlayer extends EventEmitter {
    constructor() {
        super();
        // Spawn mpg123 in remote control mode (-R)
        // -q for quiet (less console spam)
        this.process = spawn('mpg123', ['-R', '-q']);
        
        this.process.stdout.on('data', (data) => {
            const lines = data.toString().split('\n');
            for (const line of lines) {
                if (line.startsWith('@F ')) {
                    const parts = line.split(' ').filter(Boolean);
                    if (parts.length >= 4) {
                        const elapsed = parseFloat(parts[3]);
                        this.emit('time', elapsed);
                    }
                } else if (line.startsWith('@P 0')) {
                    this.emit('end');
                }
            }
        });
        
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

    seekForward(seconds) {
        if (!this.process) return;
        this.process.stdin.write(`jump +${seconds}s\n`);
    }

    seekBackward(seconds) {
        if (!this.process) return;
        this.process.stdin.write(`jump -${seconds}s\n`);
    }

    quit() {
        if (this.process) {
            this.process.kill('SIGKILL');
            this.process = null;
        }
    }
}

module.exports = new AudioPlayer();
