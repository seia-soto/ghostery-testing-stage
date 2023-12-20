import test from 'ava';
import {treeFiles} from './fs';
import path from 'path';

test('treeFiles', async t => {
	const root = path.join(process.cwd(), 'test-resources');

	t.deepEqual(await treeFiles(root), [path.join(root, 'one/example.eno')]);
});
