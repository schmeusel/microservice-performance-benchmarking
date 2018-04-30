import server from '../src/webServer/server';

server.start().then(() => {
    console.log('server started');
});
