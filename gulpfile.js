var gulp = require('gulp');
var browserify = require('gulp-browserify');
var rename = require('gulp-rename');
var watch = require('gulp-watch');

gulp.task('client-scripts', function() {
    return gulp.src('./client/lynx-client.js')
        .pipe(browserify())
        .pipe(rename('lynx-client.min.js'))
        .pipe(gulp.dest('./client/dist'));
});

gulp.task('demo-scripts', function(){
  return gulp.src('./demo/todos.js')
      .pipe(browserify())
      .pipe(rename('todos.min.js'))
      .pipe(gulp.dest('./demo/dist'));
});

gulp.task('serve', ['client-scripts', 'demo-scripts'], function(){
  gulp.watch('./client/**/*.js', ['client-scripts']);
  gulp.watch('./test/**/*.js', ['test-scripts']);
});
