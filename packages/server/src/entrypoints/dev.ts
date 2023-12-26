import {createServer} from '..';

const main = async () => {
	const server = await createServer();

	await server.listen(server.config.bind);
};

void main();
