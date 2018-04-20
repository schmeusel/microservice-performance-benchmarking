import * as express from 'express';
import * as path from 'path';
import * as socketIO from 'socket.io';
import * as http from 'http';
import * as morgan from 'morgan';
import ExperimentRunner from '../execution/ExperimentRunner';
import { PatternResultMeasurement } from '../interfaces';

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const measurementBatch = 100;

const cache = {
    measurements: []
};

// ExperimentRunner.on('SOCKET_MEASUREMENT', handlePatternResultMeasurement);

function handlePatternResultMeasurement(measurement: PatternResultMeasurement) {
    console.log('received measurement in server');
    io.emit('SOCKET_MEASUREMENT', measurement);
}

app.use(morgan());
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

server.listen(3000, () => {
    console.log('listening on port 3000');
});
