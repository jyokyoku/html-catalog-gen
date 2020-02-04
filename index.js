const path = require('path');
const fs = require('fs');
const glob = require('glob');

module.exports = (dir, options = {}) => {
	Object.keys(options).map(key => {
		if (options[key] === undefined) {
			delete options[key];
		}
	});

	options = Object.assign({
		pattern: '**/*.html',
		ignorePattern: '@(node_modules|bin|test|vendor)/**',
		generateHtml: true,
		catalogFileName: '_list.html',
	}, options);

	dir = path.resolve(dir);

	let ignorePatterns = Array.isArray(options.ignorePattern) ? options.ignorePattern : [options.ignorePattern];
	ignorePatterns.push(options.catalogFileName);

	let files = glob.sync(options.pattern, {
		cwd: dir,
		dot: true,
		ignore: ignorePatterns,
	});

	if (options.generateHtml) {
		const totals = files.length;

		let links = '';

		files.forEach((file) => {
			let name = file.replace(options.dir + path.sep, '').replace(path.sep, '/');
			links += '<li><a href="' + name + '">' + name + '</a></li>' + "\n";
		});

		const html = `
<!DOCTYPE html>
<html lang="en">
<meta name="viewport" content="width=device-width">
<head><meta charset="UTF-8">
<title>File List</title></head>
<body>
<p>Totals: ${totals} pages</p>
<ul>${links}</ul>
</body>
</html>`;

		fs.writeFileSync(path.join(dir, options.catalogFileName), html);
	}

	return files;
};