import io from 'socket.io-client';

class SocketService {
    listen(handler) {
        this.socket = io.connect();
        this.socket
            .on('connect', () => {
                console.log('Socket connected');
            })
            .on('disconnect', () => {
                console.log('Socket disconnected from server');
            })
            .on('update', handler);
    }
}

export default new SocketService();
