import io from 'socket.io-client';
import { setConnectionFlag } from '../actions/applicationActions';

class SocketService {
    listen(socketHandler) {
        this.socket = io.connect();
        this.socket
            .on('connect', () => {
                socketHandler(setConnectionFlag(true));
            })
            .on('disconnect', () => {
                socketHandler(setConnectionFlag(false));
            })
            .on('update', socketHandler);
    }
}

export default new SocketService();
