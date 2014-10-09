# grunt-splitthreejsmodel

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

A grunt plugin to split threejs json model files into geometry files and a hierarchy of object json files. For use in conjunction with [grunt-convertautodesktothreejs](https://github.com/bunnybones1/grunt-convertautodesktothreejs).

## Usage

[![NPM](https://nodei.co/npm/grunt-splitthreejsmodel.png)](https://nodei.co/npm/grunt-splitthreejsmodel/)

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install bunnybones1/grunt-splitthreejsmodeljs --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-splitthreejsmodel');
```

## The "splitthreejsmodel" task

### Overview
In your project's Gruntfile, add a section named `splitthreejsmodel` to the data object passed into `grunt.initConfig()`.

### Usage Examples

```js
grunt.initConfig({
  splitthreejsmodel: {
    options: {
      // Task-specific options go here.
    },
    exampleScene: {
      options: {
        // Target-specific options go here.
        models: [
          'test/fixtures/parse.autodesk.dae'
        ]
      }
    }
  },
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).