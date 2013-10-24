module.exports = function (grunt) {

  grunt.initConfig({
    compass: {                  // Task
      dist: {                   // Target
        options: {              // Target options
          config: 'config.rb'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-compass');

  grunt.registerTask('default', ['compass:dist']);

}