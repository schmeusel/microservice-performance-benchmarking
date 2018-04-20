import * as express from 'express';
import * as socketIO from 'socket.io';
import * as http from 'http';
import ExperimentRunner from '../execution/ExperimentRunner';
import { PatternResultMeasurement } from '../interfaces';

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

server.listen(3000, () => {
    console.log('listening on port 3000');
});

// ExperimentRunner.on('SOCKET_MEASUREMENT', handlePatternResultMeasurement);

function handlePatternResultMeasurement(measurement: PatternResultMeasurement) {
    io.emit('SOCKET_MEASUREMENT', measurement);
}

app.get('/', (req, res) => {
    res.send('Works!');
});
