import io from 'socket.io-client';

class SocketService {
    listen(handler) {
        this.socket = io.connect();
        this.socket.on('connect', () => {
            console.log('socket connected');
        });
        this.socket.on('update', handler);
    }
}

export default new SocketService();
