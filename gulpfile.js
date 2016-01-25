var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    del = require('del'),
    addsrc = require('gulp-add-src');

//delete the output file(s)
gulp.task('clean', function (cb) {
    //del is an async function and not a gulp plugin (just standard nodejs)
    //It is important to pass in the callback function so del can
    //  notify gulp when this task is complete.
    //  Without the callback, gulp will attempt to proceed with the
    //  next task before the del function is actually done delete the files.
    del(['dist/css/scrollit.css', 'dist/scripts/scrollit.min.js'], cb);
});

gulp.task('compress', ['clean'], function() {
  return gulp.src('./scrollit/scripts/scrollit.js')
  .pipe(uglify({
    mangle: false
  }))
  .pipe(addsrc.prepend('license.txt'))
  .pipe(gulp.dest('./dist/scripts/'));
});
