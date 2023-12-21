import got from 'got';

export const getBuffer = async (url: string) => new Promise<Buffer>(resolve => {
	const stream = got.stream(url);
	const buffers: Array<Buffer | Uint8Array> = [];
	let len = 0;

	stream.on('data', (data: Buffer | Uint8Array) => {
		buffers.push(data);
		len += data.length;
	});
	stream.once('end', () => {
		resolve(Buffer.concat(buffers, len));
	});
});
