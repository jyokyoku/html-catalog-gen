const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const htmlCatalogGen = require('../');

const tmpDir = __dirname + '/tmp';

const fillFiles = (depth, fileCount, ext, cwd) => {
	mkdirp.sync(cwd);

	for (let f = fileCount; f > 0; f--) {
		fs.writeFileSync(path.join(cwd, `file-${f}.${ext}`), "\n");
	}

	depth--;

	if (depth <= 0) {
		return;
	}

	fillFiles(depth, fileCount, ext, path.join(cwd, `dir-${depth}`));
};

afterEach(() => {
	rimraf.sync(tmpDir);
});

test('Generate *.html file list test', () => {
	fillFiles(3, 2, 'html', tmpDir);

	htmlCatalogGen(tmpDir);

	const html = fs.readFileSync(path.join(tmpDir, '_list.html'), 'utf8');

	expect(html).toBe(`
<!DOCTYPE html>
<html lang="en">
<meta name="viewport" content="width=device-width">
<head><meta charset="UTF-8">
<title>File List</title></head>
<body>
<p>Totals: 6 pages</p>
<ul><li><a href="dir-2/dir-1/file-1.html">dir-2/dir-1/file-1.html</a></li>
<li><a href="dir-2/dir-1/file-2.html">dir-2/dir-1/file-2.html</a></li>
<li><a href="dir-2/file-1.html">dir-2/file-1.html</a></li>
<li><a href="dir-2/file-2.html">dir-2/file-2.html</a></li>
<li><a href="file-1.html">file-1.html</a></li>
<li><a href="file-2.html">file-2.html</a></li>
</ul>
</body>
</html>`
	);
});

test('Generate *.js file list test', () => {
	const pattern = '**/*.js';

	fillFiles(3, 2, 'js', tmpDir);

	htmlCatalogGen(tmpDir, {
		pattern: pattern
	});

	const html = fs.readFileSync(path.join(tmpDir, '_list.html'), 'utf8');

	expect(html).toBe(`
<!DOCTYPE html>
<html lang="en">
<meta name="viewport" content="width=device-width">
<head><meta charset="UTF-8">
<title>File List</title></head>
<body>
<p>Totals: 6 pages</p>
<ul><li><a href="dir-2/dir-1/file-1.js">dir-2/dir-1/file-1.js</a></li>
<li><a href="dir-2/dir-1/file-2.js">dir-2/dir-1/file-2.js</a></li>
<li><a href="dir-2/file-1.js">dir-2/file-1.js</a></li>
<li><a href="dir-2/file-2.js">dir-2/file-2.js</a></li>
<li><a href="file-1.js">file-1.js</a></li>
<li><a href="file-2.js">file-2.js</a></li>
</ul>
</body>
</html>`
	);
});

test('Generate multiple file type list test', () => {
	const pattern = '**/*.@(js|html)';

	fillFiles(3, 2, 'html', tmpDir);
	fillFiles(3, 2, 'js', tmpDir);

	htmlCatalogGen(tmpDir, {
		pattern: pattern
	});

	const html = fs.readFileSync(path.join(tmpDir, '_list.html'), 'utf8');

	expect(html).toBe(`
<!DOCTYPE html>
<html lang="en">
<meta name="viewport" content="width=device-width">
<head><meta charset="UTF-8">
<title>File List</title></head>
<body>
<p>Totals: 12 pages</p>
<ul><li><a href="dir-2/dir-1/file-1.html">dir-2/dir-1/file-1.html</a></li>
<li><a href="dir-2/dir-1/file-1.js">dir-2/dir-1/file-1.js</a></li>
<li><a href="dir-2/dir-1/file-2.html">dir-2/dir-1/file-2.html</a></li>
<li><a href="dir-2/dir-1/file-2.js">dir-2/dir-1/file-2.js</a></li>
<li><a href="dir-2/file-1.html">dir-2/file-1.html</a></li>
<li><a href="dir-2/file-1.js">dir-2/file-1.js</a></li>
<li><a href="dir-2/file-2.html">dir-2/file-2.html</a></li>
<li><a href="dir-2/file-2.js">dir-2/file-2.js</a></li>
<li><a href="file-1.html">file-1.html</a></li>
<li><a href="file-1.js">file-1.js</a></li>
<li><a href="file-2.html">file-2.html</a></li>
<li><a href="file-2.js">file-2.js</a></li>
</ul>
</body>
</html>`
	);
});

test('Generate custom index file test', () => {
	const indexFile = 'custom_index.html';

	fillFiles(1, 1, 'html', tmpDir);

	htmlCatalogGen(tmpDir, {
		catalogFileName: indexFile
	});

	const html = fs.readFileSync(path.join(tmpDir, indexFile), 'utf8');

	expect(html).toBe(`
<!DOCTYPE html>
<html lang="en">
<meta name="viewport" content="width=device-width">
<head><meta charset="UTF-8">
<title>File List</title></head>
<body>
<p>Totals: 1 pages</p>
<ul><li><a href="file-1.html">file-1.html</a></li>
</ul>
</body>
</html>`
	);
});

test('Generate file list with ignore directory (match starts) test', () => {
	const pattern = '**/*.html';
	const ignorePattern = '@(node_modules|bin|test)/**';

	fillFiles(3, 2, 'html', tmpDir);
	fillFiles(2, 1, 'html', path.join(tmpDir, '/node_modules'));
	fillFiles(2, 1, 'html', path.join(tmpDir, '/dummy/node_modules'));
	fillFiles(2, 1, 'html', path.join(tmpDir, '/bin'));
	fillFiles(2, 1, 'html', path.join(tmpDir, '/dummy/bin'));

	htmlCatalogGen(tmpDir, {
		pattern: pattern,
		ignorePattern: ignorePattern,
	});

	const html = fs.readFileSync(path.join(tmpDir, '_list.html'), 'utf8');

	expect(html).toBe(`
<!DOCTYPE html>
<html lang="en">
<meta name="viewport" content="width=device-width">
<head><meta charset="UTF-8">
<title>File List</title></head>
<body>
<p>Totals: 10 pages</p>
<ul><li><a href="dir-2/dir-1/file-1.html">dir-2/dir-1/file-1.html</a></li>
<li><a href="dir-2/dir-1/file-2.html">dir-2/dir-1/file-2.html</a></li>
<li><a href="dir-2/file-1.html">dir-2/file-1.html</a></li>
<li><a href="dir-2/file-2.html">dir-2/file-2.html</a></li>
<li><a href="dummy/bin/dir-1/file-1.html">dummy/bin/dir-1/file-1.html</a></li>
<li><a href="dummy/bin/file-1.html">dummy/bin/file-1.html</a></li>
<li><a href="dummy/node_modules/dir-1/file-1.html">dummy/node_modules/dir-1/file-1.html</a></li>
<li><a href="dummy/node_modules/file-1.html">dummy/node_modules/file-1.html</a></li>
<li><a href="file-1.html">file-1.html</a></li>
<li><a href="file-2.html">file-2.html</a></li>
</ul>
</body>
</html>`
	);
});

test('Generate file list with ignore directory (match any position) test', () => {
	const pattern = '**/*.html';
	const ignorePattern = '**/@(node_modules|bin|test)/**';

	fillFiles(3, 2, 'html', tmpDir);
	fillFiles(2, 1, 'html', path.join(tmpDir, '/node_modules'));
	fillFiles(2, 1, 'html', path.join(tmpDir, '/dummy/node_modules'));
	fillFiles(2, 1, 'html', path.join(tmpDir, '/bin'));
	fillFiles(2, 1, 'html', path.join(tmpDir, '/dummy/bin'));

	htmlCatalogGen(tmpDir, {
		pattern: pattern,
		ignorePattern: ignorePattern,
	});

	const html = fs.readFileSync(path.join(tmpDir, '_list.html'), 'utf8');

	expect(html).toBe(`
<!DOCTYPE html>
<html lang="en">
<meta name="viewport" content="width=device-width">
<head><meta charset="UTF-8">
<title>File List</title></head>
<body>
<p>Totals: 6 pages</p>
<ul><li><a href="dir-2/dir-1/file-1.html">dir-2/dir-1/file-1.html</a></li>
<li><a href="dir-2/dir-1/file-2.html">dir-2/dir-1/file-2.html</a></li>
<li><a href="dir-2/file-1.html">dir-2/file-1.html</a></li>
<li><a href="dir-2/file-2.html">dir-2/file-2.html</a></li>
<li><a href="file-1.html">file-1.html</a></li>
<li><a href="file-2.html">file-2.html</a></li>
</ul>
</body>
</html>`
	);
});

test('Generate file list with ignore directory and not matched files test', () => {
	const pattern = '**/*.html';
	const ignorePattern = ['node_modules/*', 'bin/*'];

	fillFiles(3, 2, 'html', tmpDir);
	fillFiles(2, 2, 'js', tmpDir);
	fillFiles(1, 1, 'html', path.join(tmpDir, '/node_modules'));
	fillFiles(1, 1, 'html', path.join(tmpDir, '/bin'));

	htmlCatalogGen(tmpDir, {
		pattern: pattern,
		ignorePattern: ignorePattern,
	});

	const html = fs.readFileSync(path.join(tmpDir, '_list.html'), 'utf8');

	expect(html).toBe(`
<!DOCTYPE html>
<html lang="en">
<meta name="viewport" content="width=device-width">
<head><meta charset="UTF-8">
<title>File List</title></head>
<body>
<p>Totals: 6 pages</p>
<ul><li><a href="dir-2/dir-1/file-1.html">dir-2/dir-1/file-1.html</a></li>
<li><a href="dir-2/dir-1/file-2.html">dir-2/dir-1/file-2.html</a></li>
<li><a href="dir-2/file-1.html">dir-2/file-1.html</a></li>
<li><a href="dir-2/file-2.html">dir-2/file-2.html</a></li>
<li><a href="file-1.html">file-1.html</a></li>
<li><a href="file-2.html">file-2.html</a></li>
</ul>
</body>
</html>`
	);
});