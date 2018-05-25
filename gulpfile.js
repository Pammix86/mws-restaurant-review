/**
* Gulpfile to make my life easier.
*/
var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserify = require('browserify');
var eslint = require('gulp-eslint');
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var webserver = require('gulp-webserver');
var browserSync = require('browser-sync').create();

gulp.task('es6', function() {
	browserify({
    	entries: ['js/main.js', 'js/dbhelper.js', './service-worker.js'],
    	debug: true
  	})
    .transform(babelify, { presets: ['es2015'] })
    .bundle()
    .on('error',gutil.log)
    .pipe(source('bundle.js'))
    .pipe(gulp.dest(''));
});
gulp.task('default', function() {

  browserSync.init({
    server: './'
  });
});


gulp.task('images-process', function() {
  return gulp.src('images/*')
    .pipe(imagemin({
      progressive: true,
      use: [pngquant()]
    }))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('webserver', function() {
  gulp.src('./')
    .pipe(webserver({
      host: 'localhost',
      port: 3000,
      livereload: true,
      open: true,
    }));
  });
  gulp.task('lint', function () {
    return gulp.src(['js/**/*.js'])
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failOnError());
  });
  
gulp.task('watch',function() {
	gulp.watch('**/*.js',['es6'])
});
 
gulp.task('default', ['watch']);