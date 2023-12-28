import {createServer} from '..';
import {readConfig} from './utils/config';

const entrypoint = async () => {
	const config = await readConfig();
	const server = await createServer({
		config,
		features: {
			enableLogging: true,
			enableWatching: true,
		},
	});

	await server.listen(server.config.bind);
};

void entrypoint();
