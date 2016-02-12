var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    less = require('gulp-less'),
    del = require('del'),
    addsrc = require('gulp-add-src');

//delete the output file(s)
gulp.task('clean', function (cb) {
    //del is an async function and not a gulp plugin (just standard nodejs)
    //It is important to pass in the callback function so del can
    //  notify gulp when this task is complete.
    //  Without the callback, gulp will attempt to proceed with the
    //  next task before the del function is actually done delete the files.
    del.sync(['dist/css/scrollit.css', 'dist/scripts/scrollit.min.js']);
    cb();
});

gulp.task('compress-js', ['clean'], function() {
  return gulp.src('./src/scripts/scrollit.js')
  .pipe(uglify({
    mangle: false
  }))
  .pipe(addsrc.prepend('license.txt'))
  .pipe(concat('scrollit.min.js'))
  .pipe(gulp.dest('./dist/scripts/'));
});

gulp.task('compress-css', ['clean'], function(){
  return gulp.src('./src/less/scrollit.less')
    .pipe(less())
    .pipe(gulp.dest('./dist/css/'));
});

gulp.task('default', ['clean', 'compress-js', 'compress-css']);
