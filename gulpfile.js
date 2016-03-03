const gulp = require('gulp')
const gutil = require('gulp-util')
const babel = require('gulp-babel')
const plumber = require('gulp-plumber')
const browserify = require('browserify')
const dirname = require('path').dirname
const source = require('vinyl-source-stream')

const srcdir  = __dirname + '/src'
const destdir = __dirname + '/dist'

/**
 * 1. transpile all babel files
 * 2. watch src dir
 * 3. transpile on changed
 * 4. browserify if the file is web or titanium
 */
gulp.task('watch', x => {

    gulp.start('babel:all')

    gulp.watch('src/**/*.js', (info) => {

        const src = info.path
        const relpath = src.slice(srcdir.length + 1)
        const dest = destdir + '/' + dirname(relpath)

        gutil.log(`[${info.type}]: ${relpath}`)
        compileBabel(src, dest)
            .on('end', x => {
                gutil.log(`compile finished: ${dest}`)
                if (isSubDir(relpath, ['common', 'web'])) gulp.start('browserify:web')
                if (isSubDir(relpath, ['common', 'titanium'])) gulp.start('browserify:ti')
            })
    })
})

/**
 * 1. transpile all babel files
 * 2. browserify titanium and web files
 */
gulp.task('babel:all', x => {
    compileBabel('src/**/*.js', 'dist')
        .on('end', x => {
            console.log('compilation finished: all js files.')
            gulp.start('browserify:web')
            gulp.start('browserify:ti')
        })
})

/**
 * browserify titanium files
 */
gulp.task('browserify:ti', x => {
    return browserify('dist/titanium/faster-titanium.js')
        .bundle()
        .pipe(plumber())
        .pipe(source('faster-titanium.bundle.js'))
        .pipe(gulp.dest('dist/titanium'))
})

/**
 * browserify web files
 */
gulp.task('browserify:web', x => {
    return browserify('dist/web/main.js')
        .bundle()
        .pipe(plumber())
        .pipe(source('main.bundle.js'))
        .pipe(gulp.dest('dist/web'))
})



/**
 * check if given relpath is in dirs
 */
function isSubDir(relpath, dirs) {

    const subdir = relpath.split('/')[0]
    return dirs.some(dir => dir === subdir)
}


/**
 * transipile babel src to dest
 */
function compileBabel(src, dest) {
    return gulp.src(src)
        .pipe(plumber())
        .pipe(babel())
        .pipe(gulp.dest(dest))
}
