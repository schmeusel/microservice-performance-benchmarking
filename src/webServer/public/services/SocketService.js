import io from 'socket.io-client';

class SocketService {
    listen(handler) {
        this.socket = io.connect();
        this.socket.on('connect', () => {
            console.log('socket connected');
        });
        this.socket.on('update', data => {
            console.log('received data in socket service', data);
            handler(data);
        });
    }
}

export default new SocketService();
