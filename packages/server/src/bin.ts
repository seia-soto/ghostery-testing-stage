import {parseArgs} from 'util'; // From Node.JS v18.3
import {createServer} from './server';

const {values} = parseArgs({
	options: {
		watch: {
			type: 'boolean',
			short: 'w',
		},
		db: {
			type: 'string',
			short: 'd',
		},
		host: {
			type: 'string',
			short: 'h',
		},
		port: {
			type: 'string',
			short: 'p',
		},
	},
});

const fill = (key: string, value?: string) => {
	if (value) {
		process.env[key] = value;
	}
};

fill('BIND_ADDRESS', values.host);
fill('BIND_PORT', values.port);

if (values.watch) {
	process.env.WATCH = 'true';
}

if (values.db) {
	process.env.SOURCES ??= `trackerdb://${values.db}`;
}

(async () => {
	const server = await createServer();
	const addr = await server.listen({
		host: server.config.bind.address,
		port: parseInt(server.config.bind.port, 10),
	});

	console.log('server: listening on', addr);
})();

