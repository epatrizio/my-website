var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');

var sassPaths = [
  'node_modules/foundation-sites/scss',
  'node_modules/foundation-icons'
];

gulp.task('clean', function (cb) {
  var del = require('del');

  del([
    // delete everything under public directory
    './public/*',
    // except images and docs, very long to generate
    '!./public/img',
    '!./public/fonts',
    // except Git files
    '!./public/.git',
    '!./public/.gitignore'
  ], cb);
});

gulp.task('clean-img', function (cb) {
  require('del')([
    './public/img',
  ], cb);
});

gulp.task('css', ['clean'], function () {
  var cleanCSS = require('gulp-clean-css');
  // SCSS
  var sass = require('gulp-sass');
  gulp.src('./app/scss/**/*.scss')
    .pipe(sass({includePaths: sassPaths}).on('error', sass.logError))
    .pipe(cleanCSS())
    .pipe(rename('site.min.css'))
    .pipe(gulp.dest('./public/css'));
  // concat and minify CSS files and stream CSS
  return gulp.src('./app/css/**/*.css')
    .pipe(concat('app.css'))
    .pipe(cleanCSS())
    .pipe(rename('app.min.css'))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('copy-fonts', ['clean'], function() {
  return gulp.src(['./node_modules/foundation-icons/**'])
    .pipe(gulp.dest('./public/fonts/foundation-icons'));
});

gulp.task('js', ['clean'], function () {
    // jquery
  gulp.src('./node_modules/jquery/dist/jquery.min.js')
    .pipe(gulp.dest('./public/js'));
  // foundation
  gulp.src('./node_modules/foundation-sites/dist/js/foundation.min.js')
    .pipe(gulp.dest('./public/js'));
});

gulp.task('html-min', ['clean'], function() {
  var htmlmin = require('gulp-htmlmin');

  return gulp.src('./app/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('./public'));
});

gulp.task('image-min', ['clean-img'], function () {
  var imagemin = require('gulp-imagemin');
  var pngquant = require('imagemin-pngquant');

  return gulp.src('./app/img/**/*')
    .pipe(imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()]
    }))
    .pipe(gulp.dest('./public/img'));
});

gulp.task('deploy', ['build'], function(cb) {
    var ghPages = require('gh-pages');

    ghPages.publish('./public', {
        user: {
            name: 'epatrizio',
            email: 'epatrizio@mpns.fr'
        },
        message: 'Auto-generated gulp commit'
    }, cb);
});

gulp.task('build-fast', ['clean', 'css', 'js', 'html-min']);
gulp.task('build', ['build-fast', 'copy-fonts', 'image-min']);
