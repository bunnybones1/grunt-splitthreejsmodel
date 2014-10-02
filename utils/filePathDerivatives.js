var path = require('path');

function replaceExtension(filepath, extension) {
	var a = path.dirname(filepath);
	var b = path.basename(filepath, path.extname(filepath));
	return path.normalize(a + '/' + b + '.' + extension);
};

function difference(path1, path2) {
	var path1Longer = path1.length >= path2.length;
	var pathLong = path1Longer ? path1 : path2;
	var pathShort = !path1Longer ? path1 : path2;
	if(path1 == path2) {
		return '';
	} else if(pathLong.lastIndexOf(pathShort) == 0) {
		return pathLong.substring(pathShort.length, pathLong.length);
	} else {
		return false;
	}
};

module.exports = {
	replaceExtension: replaceExtension,
	difference: difference
};