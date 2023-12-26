import {parseArgs as utilsParseArgs} from 'util'; // From Node.JS v18.3

export type Option = {
	type: 'string' | 'boolean';
	short: string;
	name?: string;
	description?: string;
};

export type Options = Record<string, Option>;

/**
 * A wrapper function of utils.parseArgs to provide valid types.
 * @param options Options to parse arguments.
 * @returns
 */
export const parseArgs = <T extends Options>(options: T) => {
	const {values} = utilsParseArgs({options});

	return values;
};

/**
 * Generate help message of the program.
 * @param options Options to create help message.
 * @returns Help message in string.
 */
export const getHelpText = <T extends Options>(options: T) => {
	const entries = Object.entries(options);

	const padMultiple = 4;
	const padSize = Math.ceil(entries.reduce<number>((state, entry) => {
		let len = entry[0].length + entry[1].short.length + 5; /* '-, --'.length */

		if (entry[1].type === 'string' && entry[1].name) {
			len += entry[1].name.length + 3; /* ' <>'.length */
		}

		if (len > state) {
			return len;
		}

		return state;
	}, 0) / padMultiple) * padMultiple;

	const message = {
		command: process.argv0,
		options: entries
			.map(([long, option]) => {
				let message = `-${option.short}, --${long}`;

				if (option.type === 'string' && option.name) {
					message += ` <${option.name}>`;
				}

				message = message.padEnd(padSize, ' ');

				if (option.description) {
					message += option.description;
				}

				return message;
			})
			.join('\n  '),
	};

	return `Usage: ${message.command} [options]

Options:

  ${message.options}
`;
};
