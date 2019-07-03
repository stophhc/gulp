const gulp = require('gulp');
const concat = require('gulp-concat');//合并js
const cssclean = require('gulp-clean-css');//合并css
const clean = require('gulp-clean');//清除
const replace = require('gulp-replace');//清除
const uglify = require('gulp-uglify');//压缩js
const htmlmin = require('gulp-htmlmin'); // html代码压缩
const del=require('del');
const gulpif=require('gulp-if');
const browserSync = require('browser-sync').create(); //热更新
const reload = browserSync.reload; //将browser-sync的reload方法存起来，方便调用
//const runSequence = require('run-sequence');
const rev = require('gulp-rev');//设置hash
const revCollector = require('gulp-rev-collector');//替换html中的版本
const spritesmith = require('gulp.spritesmith');//雪碧图
const plugins = require('gulp-load-plugins')();//引用gulp所有插件

//const rename = require('gulp-rename');//重命名
//const livereload = require('gulp-livereload'); // 热更新
//const connect = require('gulp-connect'); // 热更新
//const open = require('open'); // 自动打开窗口

const config={
    proxy:'localhost',//访问本地地址
    index: 'index.html',//访问页面
    port:'8080',//端口
    usecdn:true,
    cdn: {
        img: 'https://img.ssl.q1.com/lw/huodong/kqjjs/img/',
        css: 'https://css.ssl.q1.com/lw/huodong/kqjjs/css/',
        js: 'https://css.ssl.q1.com/lw/huodong/kqjjs/js/'
    }
};

/*const mkdirp = require('mkdirp');//创建文件夹
//创建文件夹
const dirs = {
    dist:'./dist',
    src: './src',
    css: './src/css',
    js: './src/js',
    img: './src/img',
};
gulp.task('cdtext', () => {
    for (let i in dirs) {
        mkdirp(dirs[i], err => {
            err ? console.log(err) : console.log('mkdir-->' + dirs[i]);
        });
    }
});*/

//css开发处理
gulp.task('devcss',()=>{
    return gulp.src('css/*.css')
        .pipe(concat('index.css'))//合并文件
        .pipe(gulp.dest('dev/'))//输出
        .pipe(reload({stream: true}));
});

//js模块开发处理
gulp.task('devjs',()=>{
    return gulp.src('assembly/*.js')
        .pipe(concat('assembly.js'))//合并文件
        //.pipe(uglify())//压缩js文件
        .pipe(gulp.dest('dev/'))//输出
        .pipe(reload({stream: true}));
});


//js插件开发处理
gulp.task('devplug',()=>{
    return gulp.src('plug/*.js')
        .pipe(concat('plug.js'))//合并文件
        .pipe(gulp.dest('dev/'))//输出
        .pipe(reload({stream: true}));
});

//js插件生产处理
gulp.task('buildplug',()=>{
    return gulp.src(['plug/*.js'])
        .pipe(concat('plug.js'))
        .pipe(gulp.dest('dist/js/'))//输出
});

//js模块生产处理
gulp.task('buildjs',()=>{
    return gulp.src(['assembly/*.js'])
       .pipe(concat('assembly.js'))//合并文件
        .pipe(gulp.dest('dist/js'))//输出*!/
});

//js模块生产处理
gulp.task('revjs',()=>{
    return gulp.src('dist/js/*.js')
        .pipe(clean())
        .pipe(rev())
        .pipe(uglify())//压缩js文件
        .pipe(gulp.dest('dist/js/'))//输出
        .pipe(rev.manifest())
        .pipe(gulp.dest('dist/js/'))//输出

});


//css生产处理
gulp.task('buildcss',()=>{
    return gulp.src('css/*.css')
        .pipe(concat('index.css'))//合并文件
        .pipe(rev())
        .pipe(cssclean({compatibility:'ie8'}))//压缩css文件
        .pipe(gulp.dest('dist/css/'))//输出
        .pipe(rev.manifest())
        .pipe(gulp.dest('dist/css/'))//输出
});

gulp.task('sprite', function () {
    return gulp.src('icon/*.png')
        .pipe(spritesmith({
            imgName:'sprite.png',  //合成后的图片命名
            cssName:'sprite.css',  //合成后的图标样式
            padding:5,  //雪碧图中两图片的间距
            imgPath: 'img/sprite.png', // 指定路径
            algorithm:'binary-tree'  //分为top-down、left-right、diagonal、alt-diagonal、binary-tree（可实际操作查看区别）
        }))
        .pipe(gulpif('*.png', gulp.dest('./img')))
        .pipe(gulpif('*.css', gulp.dest('./css')))
});

//压缩html
gulp.task('html',()=>{
    return gulp.src(['dist/**/*.json','*.html'])
        .pipe(htmlmin({
            removeComments: true,//清除注释
            collapseWhitespace: true,//压缩
            removeEmptyAttributes: true,//删除空性值
            minifyJS: true,//压缩JS
            minifyCSS: true//压缩CSS
        }))
        .pipe(replace(/(\w+)\/\w+\.(css|js)/gi, function ($1,file) {
            var files = ''
            if($1.indexOf('.css')!==-1){
                files = 'css' + $1.replace(file, '')
            }
            if($1.indexOf('.js')!==-1){
                files = 'js' + $1.replace(file, '')
            }
            return files
        }))
        .pipe(revCollector({
            replaceReved: true,
           dirReplacements: {
                'img': function (file) {
                    return config.usecdn ? config.cdn.img + file : 'img/' + file
                },
                'css': function (file) {
                    return config.usecdn ? config.cdn.css + file : 'css/' + file
                },
                'js': function (file) {
                    return config.usecdn ? config.cdn.js + file : 'js/' + file
                }
            }
        }) )
        .pipe(gulp.dest('dist'))//输出
});


gulp.task('buildImage', function () {
    return gulp.src('./img/*.{png,jpg,gif}')
        .pipe(plugins.rev())
        .pipe(gulp.dest('dist/img/'))//输出
        .pipe(rev.manifest())
        .pipe(gulp.dest('dist/img/'))//输出
});

//livereload
/*gulp.task('watch',function(){
    livereload.listen()//开启监听

    //监听目标和绑定相应任务
    gulp.watch('src/js/!*js',gulp.series('devjs'));
    gulp.watch('src/css/!*css',gulp.series('devcss'))
});*/

//connect
/*gulp.task('server',function(){
    connect.server({
        root:'',//位置
        livereload:true,//实时刷新
        port:8092,//端口
    });
    open('http://localhost:8092/');

    //监听目标和绑定相应任务
    gulp.watch('src/js/!*js',gulp.series('devjs'));
    gulp.watch('src/css/!*css',gulp.series('devcss'))
});*/

gulp.task('server',()=>{
    browserSync.init({
        server: {
            proxy: config.proxy, // 本地地址
            index: config.index // 打开文件
        },
        port: config.port//端口
    });

    //监听目标和绑定相应任务
    gulp.watch('./*.html').on('change', reload);
    gulp.watch('assembly/*js',gulp.series('devjs'));
    gulp.watch('plug/*js',gulp.series('devplug'));
    gulp.watch('css/*css',gulp.series('devcss'));
    gulp.watch('icon/*png',gulp.series('sprite'))
});

gulp.task('dist', function () {
    return del('./dist/**/')
});

gulp.task('dev',gulp.series('devcss','devjs','devplug','sprite','server'));
gulp.task('build',gulp.series('dist','buildjs','buildplug','buildcss','buildImage','revjs','html'));
