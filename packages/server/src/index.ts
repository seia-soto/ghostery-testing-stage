import {createServer} from './server';

export type Instance = ReturnType<typeof createInstance>;

export const createInstance = async () => {
	const fastify = createServer();

	return {
		fastify,
	};
};
