'use strict';

var gulp        = require('gulp'),
    gutil       = require('gulp-util'),
    concat      = require('gulp-concat'),
    /* html */
    jade = require('gulp-jade'),
    /* css */
    stylus      = require('gulp-stylus'),
    minifycss   = require('gulp-minify-css'),
    /* js */
    coffee = require('gulp-coffee'),
    vendor = require('gulp-concat-vendor'),
    minifyjs = require('gulp-uglify'),
    es = require('event-stream'),
    /* server */
    livereload  = require('gulp-livereload'),
    server = livereload(),
    nodemon     = require('gulp-nodemon'),
    /* test */
    mocha = require('gulp-mocha'),
    karma = require('gulp-karma');

/* build */
var build = {
  htmls: ['build/public/**/*.jade', '!build/public/views/directives/*.jade'],
  directives: ['build/public/app/directives/*.jade'],
  styles: ['build/public/**/*.styl'],
  public: ['build/public/**/*.coffee'],
  server: ['build/server/**/*.coffee'],
  test: ['build/test/**/*.coffee']
}

gulp.task('htmls', function() {
  return gulp.src(build.htmls)
  .pipe(jade({
      pretty: true
    }))
  .pipe(gulp.dest('public/'));
});

gulp.task('directives', function() {
  return gulp.src(build.directives)
  .pipe(jade({
      pretty: true
    }))
  .pipe(gulp.dest('public/views/directives/'));
});

gulp.task('styles', function(){
  var stylusStream = gulp.src(build.styles)
    .pipe(stylus());

  return es.merge(stylusStream, gulp.src('build/public/assets/css/*.css'))
    .pipe(concat('styles.css'))
    .pipe(minifycss({keepBreaks:true}))
    .pipe(gulp.dest('public/assets/css/'));
});

/*gulp.task('styles', function(){
  return gulp.src(build.styles)
    .pipe(stylus())
    .pipe(concat('styles.css'))
    .pipe(minifycss({keepBreaks:true}))
    .pipe(gulp.dest('public/assets/css/'));
});*/

gulp.task('vendor', function() {  
  return gulp.src(['public/vendor/*', 'build/public/assets/js/bootstrap.js'])
    .pipe(vendor('vendor.js'))
    /*.pipe(minifyjs())*/
    .pipe(gulp.dest('public/assets/js/'))
});

gulp.task('public', function() {
  return gulp.src(build.public)
    .pipe(coffee({bare: true}))
    .pipe(concat('app.js'))
    /*.pipe(minifyjs())*/
    .pipe(gulp.dest('public/assets/js'));
});

gulp.task('server', function() {
  return gulp.src(build.server)
    .pipe(coffee({bare: true}))
    .pipe(gulp.dest('server/'));
});

gulp.task('test', function() {
  return gulp.src(build.test)
    .pipe(coffee({bare: true}))
    .pipe(gulp.dest('test/'));
});

gulp.task('assets', ['htmls', 'directives', 'styles', 'public', 'server']);

/* server */
var paths = {
  client: [
    'public/**/*.html',
    'public/**/*.js',
    'public/**/*.css'
  ],
  mocha: [
    'test/server/*.js'
  ],
  karma: [
    'public/js/vendor.js',
    'test/app-init.js',
    'public/app.js',
    'test/public/**/*.js'
  ],
  server: {
    index: 'server.js'
  }
};

var nodemonConfig = {
  script : paths.server.index,
  ignore : [
  ],
  env    : {
  }
};

gulp.task('nodemon', ['livereload'], function() {
  return nodemon(nodemonConfig);
});

/* mocha */
gulp.task('mocha', function () {
  return gulp.src(paths.mocha)
    .pipe(mocha({reporter: 'nyan'}));
});

gulp.task('karma', function() {
  return gulp.src(paths.karma)
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'start'
    }));
});

/* livereload */
gulp.task('livereload', function() {
  gulp.watch(build.htmls, ['htmls']);
  gulp.watch(build.directives, ['directives']);
  gulp.watch(build.styles, ['styles']);
  gulp.watch(build.public, ['public']);
  /*gulp.watch(build.server, ['server']);
  gulp.watch(build.test, ['test']);
  gulp.watch(paths.mocha, ['mocha']);
  gulp.watch(paths.karma, ['karma']);*/
  gulp.watch(paths.client, function(e) {
    server.changed(e.path);
  });
});

gulp.task('default', ['assets', 'nodemon', 'livereload']);