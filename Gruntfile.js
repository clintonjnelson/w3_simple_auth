'use strict';

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jscs: {
      src: ['Gruntfile.js',
              '*.js',
              'models/**/*.js',
              'routes/**/*.js',
              'test/**/*.js'
               ],
      options: {
        requireCurlyBraces: [false],
        verbose: true
      }
    },
    jshint: {
      dev: {
        src: ['Gruntfile.js',
              'package.json',
              '*.js',
              'models/**/*.js',
              'routes/**/*.js',
              'test/**/*.js'
               ]
      },
      options: {
        jshintrc: true
      },
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          captureFile: false,
          quiet: false,
          clearRequireCache: false
        },
        src: ['test/**/*_test.js']  // all tests
      }
    }
  });

  // Custom Task Chains
  grunt.registerTask('test', ['jshint:dev', 'jscs', 'mochaTest']);
  grunt.registerTask('default', ['test']);
};
