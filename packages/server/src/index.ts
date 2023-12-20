import {createServer} from './server';

(async () => {
	const server = await createServer();
	const addr = await server.listen({
		host: server.config.bind.address,
		port: parseInt(server.config.bind.port, 10),
	});

	console.log('server: listening on', addr);
})();
