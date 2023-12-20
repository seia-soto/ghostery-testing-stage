import {Type, type Static} from '@sinclair/typebox';
import {TypeCompiler} from '@sinclair/typebox/compiler';
import {numeric} from './typebox-extended';

export const configSchema = Type.Object({
	bind: Type.Object({
		address: Type.String(),
		port: Type.String({format: numeric}),
	}),
	sources: Type.String(),
	watch: Type.String(),
});

export type Config = Static<typeof configSchema>;

// eslint-disable-next-line new-cap
const checker = TypeCompiler.Compile(configSchema);

/**
 * Returns config object respecting environmental variables
 * @returns Config object candidate
 */
export const getConfigFromEnv = () => ({
	bind: {
		address: process.env.BIND_ADDRESS ?? '127.0.0.1',
		port: process.env.BIND_PORT ?? '8122',
	},
	sources: process.env.SOURCES ?? '',
	watch: process.env.WATCH ?? '',
});

/**
 * Validates unknown object to be `Config` type
 * @param obj Config object to validate, `getConfigFromEnv` is used by default
 */
export const getConfig = (obj = getConfigFromEnv()): Config => {
	// eslint-disable-next-line new-cap
	if (checker.Check(obj)) {
		console.log('config: loaded', JSON.stringify(obj));

		return obj;
	}

	// eslint-disable-next-line new-cap
	const errors = checker.Errors(obj);

	for (const error of errors) {
		console.error(`config: ${error.message} at ${error.path} but saw`, error.value);
	}

	throw new Error('Failed to validate config object!');
};
