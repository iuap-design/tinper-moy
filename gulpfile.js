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


var otherDir = ['kero', 'kero-fetch', 'neoui-kero', 'neoui-kero-mixin', 'tinper-neoui', 'tinper-neoui-grid', 'tinper-neoui-polyfill', 'tinper-neoui-tree', 'tinper-sparrow'];
var otherDirArray = [];
/**
 * 公共错误处理函数
 * 使用示例：
 *  .pipe(uglify().on('error', errHandle))
    .pipe(rename('u.min.js'))
 * @param  {[type]} err [description]
 * @return {[type]}     [description]
 */
var errHandle = function(err) {
    // 报错文件名
    var fileName = err.fileName;
    // 报错类型
    var name = err.name;
    // 报错信息
    var message = err.message;
    // 出错代码位置
    var loc = err.loc;

    var logInfo = '报错文件：' + fileName + '报错类型：' + name + '出错代码位置：' + loc.line + ',' + loc.column;

    util.log(logInfo);

    this.end();
}


gulp.task('uuiUjs', function() {
    return gulp.src(['./dist/js/moy.js', './node_modules/tinper-neoui/vendor/ui/*.js'])
        .pipe(concat('u.js'))
        .pipe(gulp.dest(uuiDist + '/js'))
        .pipe(uglify())
        .pipe(rename('u.min.js'))
        .pipe(gulp.dest(uuiDist + '/js'));
});



gulp.task('dirdist', ['uuiUjs'], function() {
    gulp.src('./locales/**')
        .pipe(gulp.dest(uuiDist + '/locales'))
    gulp.src(['./node_modules/tinper-neoui/dist/css/**', '!./node_modules/tinper-neoui/dist/css/component/', '!./node_modules/tinper-neoui/dist/css/component/**', './node_modules/tinper-neoui-grid/dist/*.css', './node_modules/tinper-neoui-tree/dist/*.css'])
        .pipe(rename(function(path) {
            if (path.basename) {
                // console.log('basename-----' + path.basename);
                if (path.basename == 'tinper-neoui' || path.basename == 'tinper-neoui.min' || path.basename.indexOf('tinper-neoui.core') > -1) {
                    path.basename = path.basename.replace('tinper-neoui', 'u');
                }
                if (path.basename.indexOf('tinper-neoui-grid') > -1) {
                    path.basename = path.basename.replace('tinper-neoui-grid', 'grid');
                }
                if (path.basename.indexOf('tinper-neoui-tree') > -1) {
                    path.basename = path.basename.replace('tinper-neoui-tree', 'tree');
                }
            }
        }))
        .pipe(gulp.dest(uuiDist + '/css'));

    gulp.src('./node_modules/tinper-neoui/dist/fonts/**')
        .pipe(gulp.dest(uuiDist + '/fonts'));

    gulp.src('./node_modules/tinper-neoui/dist/images/**')
        .pipe(gulp.dest(uuiDist + '/images'));

    return gulp.src(['./node_modules/tinper-neoui-grid/dist/*.js', './node_modules/tinper-neoui-tree/dist/*.js', './node_modules/tinper-neoui-polyfill/dist/tinper-neoui-polyfill.*'])
        .pipe(rename(function(path) {

            if (path.basename) {
                // console.log('basename-----' + path.basename);
                if (path.basename.indexOf('tinper-neoui-grid') > -1) {
                    path.basename = path.basename.replace('tinper-neoui-grid', 'u-grid');
                }
                if (path.basename.indexOf('tinper-neoui-tree') > -1) {
                    path.basename = path.basename.replace('tinper-neoui-tree', 'u-tree');
                }
                if (path.basename.indexOf('tinper-neoui-polyfill') > -1) {
                    path.basename = path.basename.replace('tinper-neoui-polyfill', 'u-polyfill');
                }
            }

        }))
        .pipe(gulp.dest(uuiDist + '/js'));
})

// 将其他目录的dist拷贝到moy的dist下

gulp.task('otherdirdist', function() {
    var tempversion, tempPkg, tempPkgPath, tempDist, originDist;
    for (var i = 0; i < otherDir.length; i++) {
        tempPkgPath = './node_modules/' + otherDir[i] + '/package.json';
        tempPkg = require(tempPkgPath);
        tempversion = tempPkg.version;
        tempDist = './dist/' + otherDir[i] + '/' + tempversion;
        otherDirArray.push(tempDist);
        originDist = './node_modules/' + otherDir[i] + '/dist/**';
        gulp.src(originDist)
            .pipe(gulp.dest(tempDist));
    }
})

gulp.task('locales', function() {
    gulp.src('./locales/**')
        .pipe(gulp.dest(uuiDist + '/locales'));
})

gulp.task('commit', ['dirdist', 'otherdirdist', 'locales'], function() {
  gulp.src('./docs/各场景资源文件说明/allREADME.md')
      .pipe(gulp.dest(uuiDist + '/'))
      .pipe(gulp.dest('./dist/uui/latest/'))
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
});


gulp.task('4needsneoui', function() {
    var neouiDir = './node_modules/tinper-neoui/dist';
    var gridDir = './node_modules/tinper-neoui-grid/dist';
    var treeDir = './node_modules/tinper-neoui-tree/dist';
    var neoui2Dir = './dist/4needs/tinper-neoui/' + uuiVersion;
    var neoui2DirLatest = './dist/4needs/tinper-neoui/latest';
    gulp.src('./docs/各场景资源文件说明/neouiREADME.md')
        .pipe(gulp.dest(neoui2Dir + '/'))
        .pipe(gulp.dest(neoui2DirLatest + '/'))
    gulp.src([neouiDir + '/css/*.css', gridDir + '/*.css', treeDir + '/*.css'])
        .pipe(gulp.dest(neoui2Dir + '/full/css'))
        .pipe(gulp.dest(neoui2DirLatest + '/full/css'));
    gulp.src(neouiDir + '/fonts/**')
        .pipe(gulp.dest(neoui2Dir + '/full/fonts'))
        .pipe(gulp.dest(neoui2DirLatest + '/full/fonts'));
    gulp.src(neouiDir + '/images/**')
        .pipe(gulp.dest(neoui2Dir + '/full/images'))
        .pipe(gulp.dest(neoui2DirLatest + '/full/images'));
    gulp.src(['./node_modules/compox/dist/compox.js', neouiDir + '/js/tinper-neoui.js'])
        .pipe(concat('tinper-neoui.js'))
        .pipe(gulp.dest(neoui2Dir + '/full/js'))
        .pipe(gulp.dest(neoui2DirLatest + '/full/js'))
        .pipe(uglify())
        .pipe(rename('tinper-neoui.min.js'))
        .pipe(gulp.dest(neoui2Dir + '/full/js'))
        .pipe(gulp.dest(neoui2DirLatest + '/full/js'));
    gulp.src([gridDir + '/*.js', treeDir + '/*.js'])
        .pipe(gulp.dest(neoui2Dir + '/full/js'))
        .pipe(gulp.dest(neoui2DirLatest + '/full/js'));

    gulp.src([neouiDir + '/css/component/*.css', neouiDir + '/css/font-awesome.css', neouiDir + '/css/font-awesome.min.css', gridDir + '/*.css', treeDir + '/*.css'])
        .pipe(gulp.dest(neoui2Dir + '/component/css'))
        .pipe(gulp.dest(neoui2DirLatest + '/component/css'));
    gulp.src(neouiDir + '/fonts/**')
        .pipe(gulp.dest(neoui2Dir + '/component/fonts'))
        .pipe(gulp.dest(neoui2DirLatest + '/component/fonts'));
    gulp.src(neouiDir + '/images/**')
        .pipe(gulp.dest(neoui2Dir + '/component/images'))
        .pipe(gulp.dest(neoui2DirLatest + '/component/images'));
    gulp.src(['./node_modules/compox/dist/compox.js', neouiDir + '/js/component/neoui-BaseComponent.js'])
        .pipe(concat('tinper-neoui-base.js'))
        .pipe(gulp.dest(neoui2Dir + '/component/js'))
        .pipe(gulp.dest(neoui2DirLatest + '/component/js'))
        .pipe(uglify())
        .pipe(rename('tinper-neoui-base.min.js'))
        .pipe(gulp.dest(neoui2Dir + '/component/js'))
        .pipe(gulp.dest(neoui2DirLatest + '/component/js'));
    gulp.src([neouiDir + '/js/component/*.js', '!' + neouiDir + '/js/component/neoui-BaseComponent.js', '!' + neouiDir + '/js/component/neoui-BaseComponent.min.js'])
        .pipe(gulp.dest(neoui2Dir + '/component/js'))
        .pipe(gulp.dest(neoui2DirLatest + '/component/js'));
    gulp.src([gridDir + '/*.js', treeDir + '/*.js'])
        .pipe(gulp.dest(neoui2Dir + '/component/js'))
        .pipe(gulp.dest(neoui2DirLatest + '/component/js'));
});

gulp.task('4needsneoui-kero', function() {
    var neouiDir = './node_modules/tinper-neoui/dist';
    var gridDir = './node_modules/tinper-neoui-grid/dist';
    var treeDir = './node_modules/tinper-neoui-tree/dist';
    var neouiKerDir = './node_modules/neoui-kero/dist';
    var neouiKero2Dir = './dist/4needs/neoui-kero/' + uuiVersion;
    var neouiKero2DirLatest = './dist/4needs/neoui-kero/latest';
    gulp.src('./docs/各场景资源文件说明/neouikeroREADME.md')
        .pipe(gulp.dest(neouiKero2Dir + '/'))
        .pipe(gulp.dest(neouiKero2DirLatest + '/'))
    gulp.src(neouiDir + '/css/*.css')
        .pipe(gulp.dest(neouiKero2Dir + '/full/css'))
        .pipe(gulp.dest(neouiKero2DirLatest + '/full/css'));
    gulp.src(neouiDir + '/fonts/**')
        .pipe(gulp.dest(neouiKero2Dir + '/full/fonts'))
        .pipe(gulp.dest(neouiKero2DirLatest + '/full/fonts'));
    gulp.src(neouiDir + '/images/**')
        .pipe(gulp.dest(neouiKero2Dir + '/full/images'))
        .pipe(gulp.dest(neouiKero2DirLatest + '/full/images'));
    gulp.src(['./node_modules/compox/dist/compox.js', './node_modules/compox-util/dist/compox-util.js', './node_modules/kero/dist/kero.js', neouiDir + '/js/component/neoui-BaseComponent.js', neouiKerDir + '/js/neoui-kero.js'])
        .pipe(concat('neoui-kero.js'))
        .pipe(gulp.dest(neouiKero2Dir + '/full/js'))
        .pipe(gulp.dest(neouiKero2DirLatest + '/full/js'))
        .pipe(uglify())
        .pipe(rename('neoui-kero.min.js'))
        .pipe(gulp.dest(neouiKero2Dir + '/full/js'))
        .pipe(gulp.dest(neouiKero2DirLatest + '/full/js'));
    gulp.src([gridDir + '/*.js', treeDir + '/*.js'])
        .pipe(gulp.dest(neouiKero2Dir + '/full/js'))
        .pipe(gulp.dest(neouiKero2DirLatest + '/full/js'));


    gulp.src([neouiDir + '/css/component/*.css', neouiDir + '/css/font-awesome.css', neouiDir + '/css/font-awesome.min.css', gridDir + '/*.css', treeDir + '/*.css'])
        .pipe(gulp.dest(neouiKero2Dir + '/component/css'))
        .pipe(gulp.dest(neouiKero2DirLatest + '/component/css'));
    gulp.src(neouiDir + '/fonts/**')
        .pipe(gulp.dest(neouiKero2Dir + '/component/fonts'))
        .pipe(gulp.dest(neouiKero2DirLatest + '/component/fonts'));
    gulp.src(neouiDir + '/images/**')
        .pipe(gulp.dest(neouiKero2Dir + '/component/images'))
        .pipe(gulp.dest(neouiKero2DirLatest + '/component/images'));
    gulp.src(['./node_modules/compox/dist/compox.js', './node_modules/compox-util/dist/compox-util.js', './node_modules/kero/dist/kero.js', neouiDir + '/js/component/neoui-BaseComponent.js', neouiKerDir + '/component/keroa-baseAdapter.js'])
        .pipe(concat('neoui-kero-base.js'))
        .pipe(gulp.dest(neouiKero2Dir + '/component/js'))
        .pipe(gulp.dest(neouiKero2DirLatest + '/component/js'))
        .pipe(uglify())
        .pipe(rename('neoui-kero-base.min.js'))
        .pipe(gulp.dest(neouiKero2Dir + '/component/js'))
        .pipe(gulp.dest(neouiKero2DirLatest + '/component/js'));
    gulp.src([neouiKerDir + '/js/component/*.js', '!' + neouiKerDir + '/js/component/keroa-baseAdapter.js', '!' + neouiKerDir + '/js/component/keroa-baseAdapter.min.js'])
        .pipe(gulp.dest(neouiKero2Dir + '/component/js'))
        .pipe(gulp.dest(neouiKero2DirLatest + '/component/js'));
    gulp.src([gridDir + '/*.js', treeDir + '/*.js'])
        .pipe(gulp.dest(neouiKero2Dir + '/component/js'))
        .pipe(gulp.dest(neouiKero2DirLatest + '/component/js'));

});

gulp.task('4needskero-fetch', function() {
  gulp.src('./docs/各场景资源文件说明/kerofetchREADME.md')
      .pipe(gulp.dest('./dist/4needs/kero-fetch/' + uuiVersion + '/'))
      .pipe(gulp.dest('./dist/4needs/kero-fetch/latest/'))
    gulp.src('./node_modules/kero-fetch/dist/*')
        .pipe(gulp.dest('./dist/4needs/kero-fetch/' + uuiVersion))
        .pipe(gulp.dest('./dist/4needs/kero-fetch/latest'));
});

gulp.task('4needstinper-neoui-polyfill', function() {
  gulp.src('./docs/各场景资源文件说明/polyfillREADME.md')
      .pipe(gulp.dest('./dist/4needs/tinper-neoui-polyfill/' + uuiVersion + '/'))
      .pipe(gulp.dest('./dist/4needs/tinper-neoui-polyfill/latest/'))
    gulp.src('./node_modules/tinper-neoui-polyfill/dist/*')
        .pipe(gulp.dest('./dist/4needs/tinper-neoui-polyfill/' + uuiVersion))
        .pipe(gulp.dest('./dist/4needs/tinper-neoui-polyfill/latest'));
});

gulp.task('4needstinper-sparrow', function() {
  gulp.src('./docs/各场景资源文件说明/sparrowREADME.md')
    .pipe(gulp.dest('./dist/4needs/tinper-sparrow/' + uuiVersion + '/'))
    .pipe(gulp.dest('./dist/4needs/tinper-sparrow/latest/'))
    gulp.src('./node_modules/tinper-sparrow/dist/*')
        .pipe(gulp.dest('./dist/4needs/tinper-sparrow/' + uuiVersion))
        .pipe(gulp.dest('./dist/4needs/tinper-sparrow/latest'));
});

gulp.task('4needs', ['4needsneoui', '4needsneoui-kero', '4needskero-fetch', '4needstinper-neoui-polyfill', '4needstinper-sparrow'], function() {

});

var needsDirs = ['kero-fetch', 'neoui-kero', 'tinper-neoui', 'tinper-neoui-polyfill', 'tinper-sparrow']
gulp.task('4needsDown', function() {
    for (var i = 0; i < needsDirs.length; i++) {
        gulp.src('./dist/4needs/' + needsDirs[i] + '/' + uuiVersion + '/**')
            .pipe(zip(needsDirs[i] + '-' + uuiVersion + '.zip'))
            .pipe(gulp.dest('dist/download'));
    }
})

gulp.task('dist', ['commit'], function() {
    gulp.run('down');
    gulp.run('new');
});

/**
 * 下载新版体验
 * @return {[type]}   [description]
 */
gulp.task('newpack', function() {
    return gulp.src([uuiDist + '/**/*', 'download/temp/*.*'])
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
    var data = fs.readFileSync(uuiDist + '/css/u.css', 'utf8');
    data = data.replace('@import \'tinper-neoui.core.css\';', '');
    fs.writeFileSync(uuiDist + '/css/u.css', data);
    var originPath, destPath;
    for (var i = 0; i < otherDirArray.length; i++) {
        gulp.src(otherDirArray[i] + '/**')
            .pipe(gulp.dest('dist/' + otherDir[i] + '/latest'));
    }
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
gulp.task("package", function() {
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
gulp.task("install", ["package"], function() {

    var targetPath = fs.realpathSync('.');

    // 安装命令
    var installCommandStr = publishConfig.command +
        " install:install-file -Dfile=" + targetPath +
        "/iuap-design.war   -DgroupId=" + publishConfig.groupId +
        " -DartifactId=" + publishConfig.artifactId +
        "  -Dversion=" + publishConfig.version + " -Dpackaging=war";

    var installWarProcess = process.exec(installCommandStr, function(err, stdout, stderr) {
        if (err) {
            console.log('install war error:' + stderr);
        }
    });

    installWarProcess.stdout.on('data', function(data) {
        console.info(data);
    });
    installWarProcess.on('exit', function(data) {
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
gulp.task("maven", ["install"], function() {
    var targetPath = fs.realpathSync('.');

    var publishCommandStr = publishConfig.command + " deploy:deploy-file  -Dfile=" + targetPath + "/iuap-design.war   -DgroupId=" + publishConfig.groupId + " -DartifactId=" + publishConfig.artifactId + "  -Dversion=" + publishConfig.version + " -Dpackaging=war  -DrepositoryId=" + publishConfig.repositoryId + " -Durl=" + publishConfig.repositoryURL;

    console.info(publishCommandStr);

    var publishWarProcess = process.exec(publishCommandStr, function(err, stdout, stderr) {
        if (err) {
            console.log('publish war error:' + stderr);
        }
    });

    publishWarProcess.stdout.on('data', function(data) {
        console.info(data);
    });
    publishWarProcess.on('exit', function(data) {
        console.info('publish  war success');
    });

});





/* 兼容之前 begin*/
var originGlobs = {
    js: [
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
    return gulp.src('./compatible/external/*') /*liuyk需要复制过去*/
        .pipe(gulp.dest(originDist + '/external'))
});


gulp.task('originassets', ['originlocales', 'originexternal'], function() {
    return gulp.src('./compatible/assets/**')
        .pipe(gulp.dest(originDist + ''))
});

/* 替换knockoutjs*/
gulp.task('replaceko', ['originujs'], function() {
    var fs = require('fs');
    fs.readFile(originDist + '/js/u.js', function(err, data) {
        if (err) throw err;
        var data = data.toString(),
            replace_str = 'factory(window["ko"] = {});',
            index = data.indexOf('// Support three module loading scenarios');
        if (index > 0) {
            var string = data.substring(index, data.indexOf('}(function(koExports, require){'))
            data = data.replace(string, replace_str);
            fs.writeFile(originDist + '/js/u.js', data, function(err) {
                if (err) throw err;
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
gulp.task('originujs', function() {
    return gulp.src(originGlobs.js)
        .pipe(concat('u.js'))
        .pipe(gulp.dest(originDist + '/js'))
        .pipe(uglify()).on('error', errHandle)
        .pipe(rename('u.min.js'))
        .pipe(gulp.dest(originDist + '/js'));
});

gulp.task('originjs', ['replaceko'], function() {

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

gulp.task('originlessgrid', function() {
    return gulp.src([uuiDist + '/css/grid.css', uuiDist + '/css/grid.min.css'])
        .pipe(gulp.dest(originDist + '/css'))
});

gulp.task('originlesstree', function() {
    return gulp.src([uuiDist + '/css/tree.css', uuiDist + '/css/tree.min.css'])
        .pipe(gulp.dest(originDist + '/css'))
});

gulp.task('originlessucore', function() {
    return gulp.src([uuiDist + '/css/u.core.css', uuiDist + '/css/u.core.min.css'])
        .pipe(gulp.dest(originDist + '/css'))
});


gulp.task('originless', ['originless:ui', 'originlessucore', 'originlesstree', 'originlessgrid'], function() {
    var data = fs.readFileSync(uuiDist + '/css/u.css', 'utf8');
    data = data.replace('@import \'u.core.css\';', '').replace('@import \'tinper-neoui.core.css\';', '');
    fs.writeFileSync(uuiDist + '/css/u.css', data);

    return gulp.src([uuiDist + '/css/u.css', './compatible/css/u.css'])
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

gulp.task('origin', ['originassets', 'originjs', 'originless', 'origincopy'], function() {
    var data = fs.readFileSync(originDist + '/css/u.css', 'utf8');
    cssheaderStr = '@import \'oldu.css\';\r\n@import \'u.core.css\';\r\n@import \'grid.css\';\r\n@import \'tree.css\';\r\n';
    data = cssheaderStr + data;
    fs.writeFileSync(originDist + '/css/u.css', data);

    var data = fs.readFileSync(originDist + '/css/u.min.css', 'utf8');
    cssheaderStr = '@import \'oldu.min.css\';\r\n@import \'u.core.min.css\';\r\n@import \'grid.min.css\';\r\n@import \'tree.min.css\';\r\n';
    data = cssheaderStr + data;
    fs.writeFileSync(originDist + '/css/u.min.css', data);
});
