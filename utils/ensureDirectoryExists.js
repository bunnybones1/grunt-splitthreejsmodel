var fs = require('fs'),
	derive = require('filepathderivatives'),
	path = require('path');
function ensureDirectoryExists(pathDst, callback) {
	var rootPath = path.resolve('.');
	var startPath = path.resolve(pathDst);
	var stepPath = path.resolve(pathDst);
	var stepsAlongPath = [];
	while(rootPath != startPath) {
		startPath = path.normalize(startPath + '/..');
		stepsAlongPath.push(derive.difference(stepPath, startPath));
		stepPath = startPath;
	}
	stepPath = rootPath;
	while(stepsAlongPath.length > 0) {
		stepPath = stepPath + stepsAlongPath.pop();
		if(!fs.existsSync(stepPath)) {
			fs.mkdirSync(stepPath);
		}
	}
	callback();	
};
module.exports = ensureDirectoryExists;