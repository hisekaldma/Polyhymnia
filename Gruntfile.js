module.exports = function(grunt) {
  var src = 'src/**/*.js';
  var tests = 'test/**/*.spec.js';
  var less = 'src/**/*.less';
  var templates = makeTemplates();

  // Project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      build: {
        src: src,
        dest: 'build/<%= pkg.name %>.js',
        options: {
          banner: templates
        }
      }
    },
    uglify: {
      build: {
        src: '<%= concat.build.dest %>',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    less: {
      build: {
        src: less,
        dest: 'build/<%= pkg.name %>.css'
      }
    },
    jshint: {
      files: [src, tests],
      options: {
        strict: true,
        quotmark: 'single',
        indent: 2
      }
    },
    jasmine: {
      src: src,
      options: {
        specs: tests
      }
    },
    'gh-pages': {
      options: {
        base: 'build',
        add: true,
        message: 'Update <%= pkg.name %> from master'
      },
      src: '**/*'
    },
    watch: {
      files: [src, tests, less],
      tasks: ['build', 'test']
    }
  });

  // Load plugins
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-gh-pages');

  // Register tasks
  grunt.registerTask('test',    ['jasmine']);
  grunt.registerTask('build',   ['jshint', 'concat', 'uglify', 'less']);
  grunt.registerTask('default', ['build', 'test', 'watch']);
  grunt.registerTask('pages',   ['build', 'test', 'gh-pages']);

  function makeTemplates() {
    var str = grunt.file.read('src/player/player.html');
    str = str.replace(/\n/g, ' ');
    str = 'var Polyhymnia = Polyhymnia || {}; Polyhymnia.templates = { \'player\': \'' + str + '\' };\n\n';
    return str;
  }
};