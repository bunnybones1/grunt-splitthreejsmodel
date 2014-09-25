function baseName(filepath) {
	return filepath.substring(filepath.lastIndexOf('/') + 1, filepath.lastIndexOf('.'));
};

function fileName(filepath) {
	return filepath.substring(filepath.lastIndexOf('/') + 1, filepath.length);
};

function path(filepath) {
	return filepath.substring(0, filepath.lastIndexOf('/') + 1);
};

function replaceExtension(filepath, extension) {
	var a = path(filepath);
	var b = baseName(filepath);
	return a + b + '.' + extension;
};

function difference(path1, path2) {
	var path1Longer = path1.length >= path2;
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
	path: path,
	fileName: fileName,
	baseName: baseName,
	replaceExtension: replaceExtension,
	difference: difference
};