import {parseArgs} from 'util'; // From Node.JS v18.3
import {createServer} from './server';

type Option = {
	type: 'string' | 'boolean';
	short: string;
	name?: string;
	description?: string;
};

type Options = Record<string, Option>;

const args = <T extends Options>(options: T) => {
	const {values} = parseArgs({options});

	return values;
};

const help = <T extends Options>(options: T) => {
	const entries = Object.entries(options);

	const padMultiple = 8;
	const padSize = Math.ceil(entries.reduce<number>((state, entry) => {
		let len = entry[0].length + entry[1].short.length + '-, --'.length;

		if (entry[1].type === 'string' && entry[1].name) {
			len += entry[1].name.length;
		}

		if (len > state) {
			return len;
		}

		return state;
	}, 0) / padMultiple) * padMultiple;

	const message = {
		command: process.argv0,
		options: entries
			.map(([long, option]) => `-${option.short}, --${long}`.padEnd(padSize, ' ') + (option.description ?? ''))
			.join('\n  '),
	};

	return `Usage: ${message.command} [options]

Options:

  ${message.options}
`;
};

const options: Options = {
	help: {
		type: 'boolean',
		short: 'h',
		description: 'Prints help message',
	},
	watch: {
		type: 'boolean',
		short: 'w',
		description: 'Watch changes',
	},
	db: {
		type: 'string',
		short: 'd',
		name: 'path',
		description: 'Path to TrackerDB',
	},
	host: {
		type: 'string',
		short: 'h',
		name: 'addr',
		description: 'Host to bind on (default: 127.0.0.1)',
	},
	port: {
		type: 'string',
		short: 'p',
		name: 'port',
		description: 'Port to bind on (default: 8122, format: numeric)',
	},
};
const values = args(options);

if (values.help) {
	console.log(help(options));

	process.exit(0);
}

const put = <T>(key: string, value: T | undefined, replacer: ((value: T) => string) = (value => value as string)) => {
	if (value) {
		process.env[key] = replacer(value);
	}
};

put('BIND_ADDRESS', values.host);
put('BIND_PORT', values.port);
put('WATCH', values.watch, _ => 'true');
put('SOURCES', values.db, value => `trackerdb://${value}`);

(async () => {
	const server = await createServer();
	const addr = await server.listen({
		host: server.config.bind.address,
		port: parseInt(server.config.bind.port, 10),
	});

	console.log('server: listening on', addr);
})();
