var gulp = require('gulp');
var less = require('gulp-less');
var minifycss = require('gulp-minify-css');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var zip = require('gulp-zip');
var del = require('del');
var fs = require('fs');
var process = require('child_process');


// 获取最新版本号
var uuiPkg = require('./node_modules/neoui-kero/package.json');
var uuiVersion = uuiPkg.version;
var uuiDist = './dist/uui/' + uuiVersion;
var originVersion = '2.0.1';
var originDist = 'dist/uui/' + originVersion;
var version = require('./version.js');

/**
 * 公共错误处理函数
 * 使用示例：
 *  .pipe(uglify().on('error', errHandle))
    .pipe(rename('u.min.js'))
 * @param  {[type]} err [description]
 * @return {[type]}     [description]
 */
var errHandle = function ( err ) {
    // 报错文件名
    var fileName = err.fileName;
    // 报错类型
    var name = err.name;
    // 报错信息
    var message = err.message;
    // 出错代码位置
    var loc = err.loc;

    var logInfo = '报错文件：' + fileName + '报错类型：' + name + '出错代码位置：' + loc.line + ',' + loc.column;

    util.log( logInfo );

    this.end();
}


gulp.task('uuiUjs', function() {
	return gulp.src(['./dist/js/moy.js','./node_modules/tinper-neoui/vendor/ui/*.js'])
		.pipe(concat('u.js'))
		.pipe(gulp.dest(uuiDist + '/js'))
		.pipe(uglify())
		.pipe(rename('u.min.js'))
		.pipe(gulp.dest(uuiDist + '/js'));
});


gulp.task('dirdist',['uuiUjs'],function(){
  gulp.src('./locales/**')
		.pipe(gulp.dest(uuiDist + '/locales'))
  gulp.src(['./node_modules/tinper-neoui/dist/css/**','./node_modules/tinper-neoui-grid/dist/css/**','./node_modules/tinper-neoui-tree/dist/css/**'])
		.pipe(gulp.dest(uuiDist + '/css'));

	gulp.src('./node_modules/tinper-neoui/dist/fonts/**')
		.pipe(gulp.dest(uuiDist + '/fonts'));

	gulp.src('./node_modules/tinper-neoui/dist/images/**')
		.pipe(gulp.dest(uuiDist + '/images'));

	gulp.src(['./node_modules/tinper-neoui-grid/dist/js/**', './node_modules/tinper-neoui-tree/dist/js/**','./node_modules/tinper-neoui-polyfill/dist/**','./node_modules/tinper-sparrow/dist/**'])
		.pipe(gulp.dest(uuiDist + '/js'));
})


gulp.task('commit', ['dirdist'], function(){
    version.init([
        uuiDist + '/js/u-polyfill.js',
        uuiDist + '/js/u-polyfill.min.js',
        uuiDist + '/js/u.js',
        uuiDist + '/js/u.min.js',
        uuiDist + '/js/u-tree.js',
        uuiDist + '/js/u-tree.min.js',
        uuiDist + '/js/u-grid.js',
        uuiDist + '/js/u-grid.min.js',
        uuiDist + '/css/u.css',
        uuiDist + '/css/u.min.css',
        uuiDist + '/css/grid.css',
        uuiDist + '/css/grid.min.css',
        uuiDist + '/css/tree.css',
        uuiDist + '/css/tree.min.css'
    ]);
})

gulp.task('dist', ['commit'], function(){
    gulp.run('down');
    gulp.run('new');
});

/**
 * 下载新版体验
 * @return {[type]}   [description]
 */
gulp.task('newpack', function() {
    return gulp.src([uuiDist + '/**/*', 'dist/download/temp/*.*'])
        .pipe(gulp.dest('dist/download/' + 'iuap-design-' + uuiPkg.version))
        .pipe(zip('iuap-design-' + uuiPkg.version + '.zip'))
        .pipe(gulp.dest('dist/download'));
});

gulp.task('down', ['newpack'], function() {
    del('dist/download/' + 'iuap-design-' + uuiPkg.version);
});

/**
 * 最新版本存放路径
 * @param  {[type]} ) {}          [description]
 * @return {[type]}   [description]
 */
gulp.task('new', function() {
    return gulp.src(uuiDist + '/**')
        .pipe(gulp.dest('dist/uui/latest'));
})




// maven 配置信息

// var publishConfig = {
//     command: "mvn",
//     repositoryId: "iUAP-Stagings",
//     repositoryURL: "http://172.16.51.12:8081/nexus/content/repositories/iUAP-Stagings",
//     artifactId: "iuap-design",
//     groupId: "com.yonyou.iuap",
//     version: uuiPkg.version
// };

var publishConfig = {
    command: "mvn",
    repositoryId: "iUAP-Stagings",
    repositoryURL: "http://172.16.51.12:8081/nexus/content/repositories/iUAP-Stagings",
    artifactId: "iuap-design",
    groupId: "com.yonyou.iuap",
    version: "3.1.0-hr"
};

/**
 * 打包为war
 * @param  {[type]} "package" [description]
 * @param  {[type]} function( [description]
 * @return {[type]}           [description]
 */
gulp.task("package", function(){
  gulp.src('./dist/uui/latest/**')
      .pipe(zip('iuap-design.war'))
      .pipe(gulp.dest('./'));

  console.info('package ok!');
});

/**
 * install 到本地
 * @param  {[type]} "install" [description]
 * @param  {[type]} function( [description]
 * @return {[type]}           [description]
 */
gulp.task("install", ["package"], function(){

  var targetPath = fs.realpathSync('.');

  // 安装命令
  var installCommandStr = publishConfig.command +
      " install:install-file -Dfile=" + targetPath +
      "/iuap-design.war   -DgroupId="+ publishConfig.groupId +
      " -DartifactId=" + publishConfig.artifactId +
      "  -Dversion="+ publishConfig.version +" -Dpackaging=war";

    var installWarProcess = process.exec(installCommandStr, function(err,stdout,stderr){
        if(err) {
            console.log('install war error:'+stderr);
        }
    });

    installWarProcess.stdout.on('data',function(data){
        console.info(data);
    });
    installWarProcess.on('exit',function(data){
    console.info('install war success');
  })

});

/**
 * 发布到maven仓库中
 * @param  {[type]} "deploy"    [description]
 * @param  {[type]} ["package"] [description]
 * @param  {[type]} function(   [description]
 * @return {[type]}             [description]
 */
gulp.task("maven", ["install"], function(){
  var targetPath = fs.realpathSync('.');

  var publishCommandStr =  publishConfig.command + " deploy:deploy-file  -Dfile="+ targetPath+"/iuap-design.war   -DgroupId="+ publishConfig.groupId +" -DartifactId="+ publishConfig.artifactId +"  -Dversion="+ publishConfig.version +" -Dpackaging=war  -DrepositoryId="+ publishConfig.repositoryId +" -Durl=" +publishConfig.repositoryURL;

  console.info(publishCommandStr);

  var publishWarProcess =   process.exec(publishCommandStr, function(err,stdout,stderr){
    if(err) {
      console.log('publish war error:'+stderr);
    }
  });

  publishWarProcess.stdout.on('data',function(data){
    console.info(data);
  });
  publishWarProcess.on('exit',function(data){
    console.info('publish  war success');
  });

});





/* 兼容之前 begin*/
var originGlobs = {
    js:[
        './compatible/biz/knockout-3.2.0.debug.js',
        uuiDist + '/js/u-polyfill.js',
        uuiDist + '/js/u.js',
        uuiDist + '/js/u-grid.js',
        uuiDist + '/js/u-tree.js',
        './compatible/src/dialog_.js',
        './compatible/u/validate.js',
        './compatible/u/autocomplete.js',
        './compatible/u/backtop.js',
        './compatible/u/dialog.js',
        './compatible/u/moment.js',
        './compatible/u/neoui-datetimepicker.js',
        './compatible/u/formater.js',
        './compatible/u/JsExtensions.js',
        './compatible/u/loading.js',
        './compatible/u/message.js',
        './compatible/biz/compManager.js',
        './compatible/biz/compatible.js',
        './compatible/biz/input.js',
        './compatible/biz/datetime.js',
        './compatible/biz/checkbox.js',
    ]
};

gulp.task('originlocales', function() {
    gulp.src('./compatible/locales/en/*')
        .pipe(gulp.dest(originDist + '/locales/en'));
    gulp.src('./compatible/locales/en_US/*')
        .pipe(gulp.dest(originDist + '/locales/en_US'));
    gulp.src('./compatible/locales/en-US/*')
        .pipe(gulp.dest(originDist + '/locales/en-US'));
    gulp.src('./compatible/locales/zh/*')
        .pipe(gulp.dest(originDist + '/locales/zh'));
    gulp.src('./compatible/locales/zh-CN/*')
        .pipe(gulp.dest(originDist + '/locales/zh-CN'));
    gulp.src('./compatible/locales/zh_CN/*')
        .pipe(gulp.dest(originDist + '/locales/zh_CN'));
});

gulp.task('originexternal', function() {
    return gulp.src('./compatible/external/*')  /*liuyk需要复制过去*/
        .pipe(gulp.dest(originDist + '/external'))
});


gulp.task('originassets', ['originlocales', 'originexternal'], function(){
    return gulp.src('./compatible/assets/**')
        .pipe(gulp.dest(originDist + ''))
});

/* 替换knockoutjs*/
gulp.task('replaceko',['originujs'], function(){
    var fs = require('fs');
    fs.readFile( originDist + '/js/u.js',function(err,data){
        if(err) throw err;
        var data = data.toString(),
            replace_str = 'factory(window["ko"] = {});',
            index = data.indexOf('// Support three module loading scenarios');
        if(index>0){
            var string = data.substring(index,data.indexOf('}(function(koExports, require){'))
            data = data.replace(string,replace_str);
            fs.writeFile(originDist + '/js/u.js',data,function(err){
                if(err) throw err;
                console.log('has finished');
            });
        }
    });
    return gulp.src(originDist + '/js/u.js')
            .pipe(uglify()).on('error', errHandle)
            .pipe(rename('u.min.js'))
            .pipe(gulp.dest(originDist + '/js'));
});

/* JS直接使用新的JS加上兼容js*/
gulp.task('originujs',function(){
    return gulp.src(originGlobs.js)
            .pipe(concat('u.js'))
            .pipe(gulp.dest(originDist + '/js'))
            .pipe(uglify()).on('error', errHandle)
            .pipe(rename('u.min.js'))
            .pipe(gulp.dest(originDist + '/js'));
});

gulp.task('originjs', ['replaceko'],function() {

});


/* CSS直接使用新的css*/
gulp.task('originless:ui', function() {
    return gulp.src('./compatible/less/import.less')
        .pipe(less())
        .pipe(rename('oldu.css'))
        .pipe(gulp.dest(originDist + '/css'))
        .pipe(minifycss())
        .pipe(concat('oldu.min.css'))
        .pipe(gulp.dest(originDist + '/css'));
});

gulp.task('originlessgrid', function(){
    return gulp.src([uuiDist + '/css/grid.css',uuiDist + '/css/grid.min.css'])
        .pipe(gulp.dest(originDist + '/css'))
});

gulp.task('originlesstree', function(){
    return gulp.src([uuiDist + '/css/tree.css',uuiDist + '/css/tree.min.css'])
        .pipe(gulp.dest(originDist + '/css'))
});

gulp.task('originlessucore', function(){
    return gulp.src([uuiDist + '/css/u.core.css',uuiDist + '/css/u.core.min.css'])
        .pipe(gulp.dest(originDist + '/css'))
});


gulp.task('originless',['originless:ui','originlessucore','originlesstree','originlessgrid'], function() {
    var data = fs.readFileSync(uuiDist + '/css/u.css', 'utf8');
    data = data.replace('@import \'u.core.css\';','');
    fs.writeFileSync(uuiDist + '/css/u.css', data);

    return gulp.src([uuiDist + '/css/u.css','./compatible/css/u.css'])
            .pipe(concat('u.css'))
            .pipe(gulp.dest(originDist + '/css'))
            .pipe(minifycss())
            .pipe(concat('u.min.css'))
            .pipe(gulp.dest(originDist + '/css'));

});
///////////////////////////////////////

gulp.task('origincopy', function() {
    gulp.src([uuiDist] + '/css/font-awesome' + '*' + '.css')
        .pipe(gulp.dest(originDist + '/fonts/font-awesome/css'));
    gulp.src([uuiDist + '/images/**'])
        .pipe(gulp.dest(originDist + '/images'));

})

gulp.task('origin', ['originassets', 'originjs', 'originless', 'origincopy'],function(){
    var data = fs.readFileSync(originDist + '/css/u.css', 'utf8');
    cssheaderStr = '@import \'oldu.css\';\r\n@import \'u.core.css\';\r\n@import \'grid.css\';\r\n@import \'tree.css\';\r\n';
    data = cssheaderStr + data;
    fs.writeFileSync(originDist + '/css/u.css', data);

    var data = fs.readFileSync(originDist + '/css/u.min.css', 'utf8');
    cssheaderStr = '@import \'oldu.min.css\';\r\n@import \'u.core.min.css\';\r\n@import \'grid.min.css\';\r\n@import \'tree.min.css\';\r\n';
    data = cssheaderStr + data;
    fs.writeFileSync(originDist + '/css/u.min.css', data);
});
