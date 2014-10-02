var _ = require('lodash');
var path = require('path');
var geometriesData;
var embedsData;
var optimizeGeometry = require('./optimizeGeometry');
var useOptimize = true;
var optimizeDecimalPlaces = 3;
var reduceRedudantGeometry = true;
var findSimilarGeometry = require('./findSimilarGeometry');
var _geometryCache; 
function saveObjectData(data, pathDst, objectsToWrite, grunt) {
	if(data.children) {
		for(var objectName in data.children) {
			var object = data.children[objectName];
			saveObjectData(object, path.normalize(pathDst + objectName + '/'), objectsToWrite, grunt);
		};
		for(var objectName in data.children) {
			data.children[objectName] = objectName;
		}
	}
	objectsToWrite[path.normalize(pathDst+'/index')] = data;
	saveGeometryDataIfAvailable(data, pathDst, objectsToWrite, grunt);
}

function saveGeometryDataIfAvailable(data, pathDst, objectsToWrite, grunt) {
	if(data.geometry) {
		var geometryData = embedsData[geometriesData[data.geometry].id];
		if(useOptimize) optimizeGeometry(geometryData, optimizeDecimalPlaces);

		function queueGeometryWrite() {
			objectsToWrite[path.normalize('geometry/' + data.geometry)] = geometryData;
		}

		if(reduceRedudantGeometry) {
			var redundantGeometryName = findSimilarGeometry(geometryData, _geometryCache);
			if(redundantGeometryName) {
				grunt.log.oklns("REUSING", redundantGeometryName);
				data.geometry = redundantGeometryName;
			}else{
				grunt.log.oklns("CREATING", data.geometry);
				_geometryCache[data.geometry] = geometryData;
				queueGeometryWrite();
			}
		} else {
			queueGeometryWrite();
		}
	}
}
function splitModel(data, pathDst, grunt) {
	var objectsToWrite = {};
	_geometryCache = {};
	geometriesData = data.geometries;
	embedsData = data.embeds;
	var root = {
		children : data.objects
	}
	saveObjectData(root, pathDst, objectsToWrite, grunt);
	return objectsToWrite;
}

module.exports = splitModel;
