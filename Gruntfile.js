var mozjpeg = require('imagemin-mozjpeg');
module.exports = function(grunt) {

  grunt.initConfig(
    {
    responsive_images: {
      dev: {
        options: {
          engine: 'im',
          quality: 50,
          sizes: [
            {
              name: "small",
              width: 200
            },
            {
              name: "large",
              width: 450
            }
          ]
        },
        files: [{
          expand: true,
          src: ['*.{gif,jpg,png}'],
          cwd: 'img/',
          dest: 'images/'
        }]
      }
    },
 /* Clear out the images directory if it exists */
 clean: {
  dev: {
    src: ['images'],
  }
},
/* Generate the images directory if it is missing */
mkdir: {
  dev: {
    options: {
      create: ['images']
    },
  },
},
imagemin: {
  png: {
    options: {
      optimizationLevel: 7,
      progressive: true,
      use: [ mozjpeg()]
    },
    files: [
      {
        // Set to true to enable the following options…
        expand: true,
        // cwd is 'current working directory'
        cwd: 'images/',
        src: ['**/*.png'],
        // Could also match cwd line above. i.e. project-directory/img/
        dest: 'images/compressed/',
        ext: '.png'
      }
    ]
  },
  jpg: {
    options: {
      progressive: true
    },
    files: [
      {
        // Set to true to enable the following options…
        expand: true,
        // cwd is 'current working directory'
        cwd: 'images/',
        src: ['**/*.jpg'],
        // Could also match cwd. i.e. project-directory/img/
        dest: 'images/compressed/',
        ext: '.jpg'
      }
    ]
  }
}
  });
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-responsive-images');
  grunt.loadNpmTasks('grunt-mkdir');
  //grunt.registerTask('default', ['mkdir','responsive_images']);
  grunt.registerTask('default', ['imagemin']);
};