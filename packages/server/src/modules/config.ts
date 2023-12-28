import {Type, type Static} from '@sinclair/typebox';
import {TypeCompiler} from '@sinclair/typebox/compiler';

export const configSchema = Type.Object({
	bind: Type.Object({
		host: Type.String(),
		port: Type.Number(),
	}),
	sources: Type.Array(Type.Object({
		type: Type.String(),
		url: Type.String(),
	})),
});

// eslint-disable-next-line new-cap
export const configType = TypeCompiler.Compile(configSchema);

export type Config = Static<typeof configSchema>;

/**
 * Parse and validate config file.
 * @param candidate The candidate config object before validation.
 * @returns An array consisted of status and config or config related error data.
 */
export const validateConfig = (candidate: unknown) => {
	// eslint-disable-next-line new-cap
	if (!configType.Check(candidate)) {
		// eslint-disable-next-line new-cap
		const errors = configType.Errors(candidate);

		return [false, errors] as const;
	}

	return [true, candidate] as const;
};
