var _ = require('lodash');
var path = require('path');
var geometriesData;
var embedsData;
var optimizeGeometry = require('./optimizeGeometry');
var useOptimize = true;
var optimizeDecimalPlaces = 3;
var includeExistingGeometryInRedundancyHunt = true;
var reduceRedudantGeometry = true;
var findSimilarGeometry = require('./findSimilarGeometry');
function crawlSplitAndSaveHierarchyData(data, pathDst, objectsToWrite, grunt) {
	if(data.children) {
		for(var objectName in data.children) {
			var object = data.children[objectName];
			crawlSplitAndSaveHierarchyData(object, path.normalize(pathDst + objectName + '/'), objectsToWrite, grunt);
		};
		for(var objectName in data.children) {
			data.children[objectName] = objectName;
		}
	}
	objectsToWrite[path.normalize(pathDst+'/index')] = data;
}

function crawlExtractAndSaveGeometryData(data, objectsToWrite, cache, grunt) {
	if(data.children) {
		for(var objectName in data.children) {
			var object = data.children[objectName];
			crawlExtractAndSaveGeometryData(object, objectsToWrite, cache, grunt);
		};
	}
	saveGeometryDataIfAvailable(data, objectsToWrite, cache, grunt);
}

function saveGeometryDataIfAvailable(data, objectsToWrite, cache, grunt) {
	if(data.geometry) {
		var geometryData = embedsData[geometriesData[data.geometry].id];
		if(useOptimize) optimizeGeometry(geometryData, optimizeDecimalPlaces);

		function queueGeometryWrite() {
			objectsToWrite[path.normalize('geometry/' + data.geometry)] = geometryData;
		}
		if(reduceRedudantGeometry) {
			var redundantGeometryName = findSimilarGeometry(geometryData, cache);
			if(redundantGeometryName) {
				grunt.log.oklns("REUSING", redundantGeometryName);
				data.geometry = redundantGeometryName;
			}else{
				grunt.log.oklns("CREATING", data.geometry);
				cache[data.geometry] = geometryData;
				queueGeometryWrite();
			}
		} else {
			queueGeometryWrite();
		}
	}
}
function splitModel(data, pathDst, cache, grunt) {
	var pathDelimiter = process.platform == 'win32' ? '\\' : '/';
	var objectsToWrite = {};
	cache = cache || {};

	if(includeExistingGeometryInRedundancyHunt) {}

	geometriesData = data.geometries;
	embedsData = data.embeds;
	var root = {
		children : data.objects
	}

	crawlExtractAndSaveGeometryData(root, objectsToWrite, cache, grunt);

	var hierarchyPath = pathDst;
	if(hierarchyPath.lastIndexOf(pathDelimiter) == hierarchyPath.length-1) hierarchyPath = hierarchyPath.substring(0, hierarchyPath.length-1);
	objectsToWrite[path.normalize(hierarchyPath) + '.hierarchy'] = _.cloneDeep(data.objects);

	crawlSplitAndSaveHierarchyData(root, pathDst, objectsToWrite, grunt);
	return objectsToWrite;
}

module.exports = splitModel;
