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
  derive = require('../utils/filePathDerivatives'),
  THREE = require('../lib/three.min.nodejs'),
  ensureDirectoryExists = require('../utils/ensureDirectoryExists');

var done;
var options;
var _grunt;
var outputPath;

var writing = 0;
var wrote = 0;

function isDoneWritingAllFiles() {
  return writing === wrote;
}

function writeStringToFile(data, path) {
  fs.open(path, 'wx', function(err, fd){
    if(fd) {
      fs.write(fd, data, 0, 'utf8', function(err, written, buffer) {
        fs.close(fd);
        _grunt.log.oklns('wrote', derive.difference(outputPath, path));
        wrote++;
        if(isDoneWritingAllFiles()) {
          done();
        }
      });
    }
  });
}

function writeStringToFileEvenIfExists(data, path) {
  fs.exists(path, function(exists){
    if(exists) {
      fs.unlink(path, function() {
        writeStringToFile(data, path);
      });
    } else {
      writeStringToFile(data, path);
    }
  });
}

function writeObjectFile(objectName, objectData) {
  var cloneString = JSON.stringify(objectData);
  var objectPath = path.resolve(outputPath + objectName + '.json');
  _grunt.log.oklns("writing", objectName);
  writing++;
  ensureDirectoryExists(objectPath, function() {
    writeStringToFileEvenIfExists(cloneString, objectPath);
  });
}

function splitModel(srcPath) {
  var inputPath = path.resolve(derive.replaceExtension(srcPath, 'json'));
  console.log(inputPath);
  outputPath = path.resolve(derive.path(srcPath)) + '/';
  console.log(outputPath);
  ensureDirectoryExists(outputPath, function() {
    fs.readFile(inputPath, 'utf8', function (err, dataString) {
      _grunt.log.oklns('Loading', inputPath);
      if (err) {
        _grunt.fail.warn(err);
        done();
        return;
      }

      _grunt.log.oklns('Loaded', ~~(dataString.length * 0.001) * 0.001, 'megabytes');
      var baseName = derive.baseName(inputPath);

      _grunt.log.oklns('Splitting...');
      //var loader = new THREE.SceneLoader();
      var data = JSON.parse(dataString);
      var objectsToWrite = require('../utils/splitModel')(data, baseName + '/', _grunt);
      for(var objectName in objectsToWrite) {
        //write the json files
        writeObjectFile(objectName, objectsToWrite[objectName]);
      }
    });
  });
}

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  // External libs.
  //var _ = require('lodash');

  // Internal libs.
  //var git = require('./lib/git').init(grunt);
  _grunt = grunt;

  grunt.registerMultiTask('splitthreejsmodel', 'A grunt plugin to split threejs json model files into geometry files and a hierarchy of object json files. For use in conjunction with [grunt-convertautodesktothree](https://github.com/bunnybones1/grunt-convertautodesktothreejs).', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    options = this.options({
    });
    done = this.async();

    for (var i = options.models.length - 1; i >= 0; i--) {
      splitModel(options.models[i]);
    }
  });
};
