/*
 * grunt-splitthreejsmodel
 * https://github.com/Tomasz/grunt-splitthreejsmodel
 *
 * Copyright (c) 2014 Tomasz Dysinski
 * Licensed under the MIT license.
 */
'use strict';

// Nodejs libs.
var path = require('path'),
  fs = require('fs'),
  tar = require('tar'),
  _ = require('lodash'),
  derive = require('filepathderivatives'),
  THREE = require('../lib/three.min.nodejs'),
  splitModelUtil = require('../utils/splitModel'),
  ensureDirectoryExists = require('../utils/ensureDirectoryExists');

//task shared scope
var writing = 0;
var wrote = 0;
var done;
var options;
var _grunt;

var _geometryCaches = {};

function isDoneWritingAllFiles() {
  return writing === wrote;
}

//individual file scope
function SplitModel(srcPath, callback){
  var inputPath = derive.replaceExtension(srcPath, 'json');
  _grunt.verbose.writeln('splitting', srcPath, inputPath);
  var _this = this;
  this.outputPath = path.normalize(path.dirname(srcPath) + '/' + path.basename(srcPath, path.extname(srcPath)) + '/..');
  this.loadExistingGeometryCache(this.outputPath, function(cache) {
    _this.cache = cache;
    _grunt.verbose.writeln('outputting to', _this.outputPath);
    ensureDirectoryExists(_this.outputPath, function() {
      fs.readFile(inputPath, 'utf8', function (err, dataString) {
        _grunt.log.oklns('Loading', inputPath);
        if (err) {
          _grunt.fail.warn(err);
          callback();
          return;
        }

        _grunt.log.oklns('Loaded', ~~(dataString.length * 0.001) * 0.001, 'megabytes');
        var baseName = path.basename(inputPath, path.extname(inputPath));

        _grunt.log.oklns('Splitting...');
        //var loader = new THREE.SceneLoader();
        var data = JSON.parse(dataString);
        var objectsToWrite = splitModelUtil(data, path.normalize(baseName + '/'), _this.cache, _grunt);
        for(var objectName in objectsToWrite) {
          //write the json files
          _this.writeObjectFile(objectName, objectsToWrite[objectName], callback);
        }
      });
    });
  });
}

SplitModel.prototype = {
  writeStringToFile: function(data, pathDst, callback) {
    var _this = this;
    fs.open(pathDst, 'wx', function(err, fd){
      if(fd) {
        fs.write(fd, data, 0, 'utf8', function(err, written, buffer) {
          fs.close(fd);
          _grunt.log.oklns('wrote', derive.difference(_this.outputPath, pathDst));
          wrote++;
          if(isDoneWritingAllFiles()) {
            callback();
          }
        });
      }
    });
  },

  writeStringToFileEvenIfExists: function(data, pathDst, callback) {
    var _this = this;
    fs.exists(pathDst, function(exists){
      if(exists) {
        fs.unlink(pathDst, function() {
          _this.writeStringToFile(data, pathDst, callback);
        });
      } else {
        _this.writeStringToFile(data, pathDst, callback);
      }
    });
  },

  writeObjectFile: function(objectName, objectData, callback) {
    var cloneString = JSON.stringify(objectData);
    var objectPath = path.normalize(this.outputPath + '/' + objectName + '.json');
    _grunt.log.oklns("writing", objectName);
    writing++;
    var _this = this;
    ensureDirectoryExists(path.dirname(objectPath), function() {
      _this.writeStringToFileEvenIfExists(cloneString, objectPath, callback);
    });
  },


  loadExistingGeometryCache: function(outputPath, callback) {
    _grunt.log.oklns('LOADING PRE-EXISTING GEOMETRY');
    
    var geometryCache = _geometryCaches[outputPath];
    var geometryToLoad = 0;
    function checkIfAllGeometryCached() {
      if(geometryToLoad === 0) {
        callback(geometryCache);
      }
    }
    if(!geometryCache) {
      _grunt.log.oklns("CREATING GEOMETRY CACHE FOR", outputPath);
      geometryCache = _geometryCaches[outputPath] = {};
      var geometryPath = path.normalize(outputPath + '/geometry');
      ensureDirectoryExists(geometryPath, function() {
        fs.readdir(geometryPath, function(err, files) {
          if(err) { throw err; }
          function handleGeometryData(filePath, err, dataString) {
            if(err) { throw err; }
            var fileKey = path.normalize(path.dirname(filePath) + '/' + path.basename(filePath, path.extname(filePath)));
            geometryCache[fileKey] = JSON.parse(dataString);
            _grunt.log.oklns('PRECACHED', fileKey);
            geometryToLoad--;
            checkIfAllGeometryCached();
          }
          if(files.length > 0) {
            for (var i = files.length - 1; i >= 0; i--) {
              geometryToLoad++;
              fs.readFile(path.resolve(geometryPath + '/' + files[i]), handleGeometryData.bind(null, files[i]));
            }
          } else {
            callback(geometryCache);
          }
        });
      });
    } else {
      _grunt.log.oklns("REUSING GEOMETRY CACHE FOR", outputPath);
      callback(geometryCache);
    }
  }
};

module.exports = function(grunt) {

  _grunt = grunt;

  grunt.registerMultiTask('splitthreejsmodel', 'A grunt plugin to split threejs json model files into geometry files and a hierarchy of object json files. For use in conjunction with [grunt-convertautodesktothree](https://github.com/bunnybones1/grunt-convertautodesktothreejs).', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    options = this.options({
    });
    done = this.async();

    function splitNextModel() {
      if(options.models.length > 0) {
        grunt.log.oklns('PROCESS MODEL', options.models[0]);
        new SplitModel(options.models.splice(0, 1), splitNextModel);
      } else {
        done();
      }
    }
    splitNextModel();

    console.log(_geometryCaches);

  });
};
