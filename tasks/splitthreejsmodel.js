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

//task shared scope
var writing = 0;
var wrote = 0;
var done;
var options;
var _grunt;

function isDoneWritingAllFiles() {
  return writing === wrote;
}

//individual file scope
function SplitModel(srcPath) {
  var inputPath = path.resolve(derive.replaceExtension(srcPath, 'json'));
  console.log(inputPath);
  var _this = this;
  this.outputPath = path.resolve(derive.path(srcPath)) + '/';
  console.log(this.outputPath);
  ensureDirectoryExists(this.outputPath, function() {
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
        _this.writeObjectFile(objectName, objectsToWrite[objectName]);
      }
    });
  });
}

SplitModel.prototype = {
  writeStringToFile: function(data, path) {
    var _this = this;
    fs.open(path, 'wx', function(err, fd){
      if(fd) {
        fs.write(fd, data, 0, 'utf8', function(err, written, buffer) {
          fs.close(fd);
          _grunt.log.oklns('wrote', derive.difference(_this.outputPath, path));
          wrote++;
          if(isDoneWritingAllFiles()) {
            done();
          }
        });
      }
    });
  },

  writeStringToFileEvenIfExists: function(data, path) {
    var _this = this;
    fs.exists(path, function(exists){
      if(exists) {
        fs.unlink(path, function() {
          _this.writeStringToFile(data, path);
        });
      } else {
        _this.writeStringToFile(data, path);
      }
    });
  },

  writeObjectFile: function(objectName, objectData) {
    var cloneString = JSON.stringify(objectData);
    var objectPath = path.resolve(this.outputPath + objectName + '.json');
    _grunt.log.oklns("writing", objectName);
    writing++;
    var _this = this;
    ensureDirectoryExists(objectPath, function() {
      _this.writeStringToFileEvenIfExists(cloneString, objectPath);
    });
  },
}

module.exports = function(grunt) {

  _grunt = grunt;

  grunt.registerMultiTask('splitthreejsmodel', 'A grunt plugin to split threejs json model files into geometry files and a hierarchy of object json files. For use in conjunction with [grunt-convertautodesktothree](https://github.com/bunnybones1/grunt-convertautodesktothreejs).', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    options = this.options({
    });
    done = this.async();

    for (var i = options.models.length - 1; i >= 0; i--) {
      new SplitModel(options.models[i]);
    }
  });
};
