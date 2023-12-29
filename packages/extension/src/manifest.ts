import pkg from '../package.json';

export const manifest: chrome.runtime.ManifestV2 = {
	author: pkg.author,
	name: pkg.displayName ?? pkg.name,
	version: pkg.version,
	// eslint-disable-next-line @typescript-eslint/naming-convention
	manifest_version: 2,
	permissions: ['*://*/*'],
};
