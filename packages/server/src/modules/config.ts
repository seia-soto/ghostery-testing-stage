import {type Static, Type} from '@sinclair/typebox';
import {TypeCompiler} from '@sinclair/typebox/compiler';
import * as yaml from 'yaml';

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

export const parseConfig = (source: string) => {
	const candidate = yaml.parse(source) as unknown;

	// eslint-disable-next-line new-cap
	if (!configType.Check(candidate)) {
		// eslint-disable-next-line new-cap
		const errors = configType.Errors(candidate);

		return [false, errors] as const;
	}

	return [true, candidate] as const;
};
