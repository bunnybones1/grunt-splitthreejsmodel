/*
 * grunt-splitthreejsmodel
 * https://github.com/Tomasz/grunt-splitthreejsmodel
 *
 * Copyright (c) 2014 Tomasz Dysinski
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    //note that filenames will automatically be fixed into .json. This is to help simplify your configs when used in conjunction with grunt-convertautodesktothreejs
    splitthreejsmodel: {
      options: {
        standaloneTest: true
      },
      default_options: {
        options: {
          models: [
            'test/model1/parse.autodesk.dae',
            'test/model1/parse.autodesk.2.dae',
            'test/model2/parse2.autodesk.dae'
          ]
        }
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'splitthreejsmodel', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
