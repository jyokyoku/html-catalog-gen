#!/usr/bin/env node

let mode = '';
let skip = false;

let dir = '';
let pattern;
let exclude;
let catalog;

const usage = () => `
usage: html-catalog-gen INPUT_DIR {OPTIONS}

  Generate a html files index with links.

OPTIONS are:

  -c --catalog  The name of the catalog file.
  -p --pattern  The pattern of the file you want to list.
  -e --exclude  The pattern of the exclude files or directory.
  -v --version  Print the html-catalog-gen version number
`;

process.argv.slice(2).filter((arg) => {
	if (arg === '-v' || arg === '--version') {
		console.log(require('../package.json').version);
		process.exit(0);

	} else if (arg === '-h' || arg === '--help') {
		console.log(usage());
		process.exit(0);

	} else if (arg === '-c' || arg === '--catalog') {
		mode = 'catalog';
		skip = false;

	} else if (arg === '-p' || arg === '--pattern') {
		mode = 'pattern';
		skip = false;

	} else if (arg === '-i' || arg === '--ignore') {
		mode = 'ignore';
		skip = false;

	} else if (arg.match(/^-/)) {
		skip = true;

	} else if (skip) {
		return false;

	} else if (mode === 'catalog') {
		catalog = arg;

	} else if (mode === 'pattern') {
		pattern = arg;

	} else if (mode === 'ignore') {
		exclude = arg;

	} else {
		dir = arg;
	}
});

if (!dir) {
	console.log(usage());
	process.exit(0);
}

try {
	require('../')(dir, {
		catalogFileName: catalog,
		pattern: pattern,
		ignorePattern: exclude
	});

} catch (e) {
	console.error(e);
	process.exit(1);
}