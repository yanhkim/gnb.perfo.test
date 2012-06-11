#!/usr/bin/env node

var inpath = 'templates',
    outpath = '../src/js/templates.js';

var argv = require('optimist').argv,
    uglify = require('uglify-js'),
    hogan = require('hogan.js'),
    fs = require('fs'),
    path = require('path');

function minify(code) {
    var jsp = uglify.parser,
        pro = uglify.uglify,
        ast = jsp.parse(code);

    ast = pro.ast_mangle(ast);
    ast = pro.ast_squeeze(ast);
    return pro.gen_code(ast);
}

var writer = (function() {
    var jobs = {}, num = 0, finding = true,
        buf = '', postface, _minify = false;

    function write() {
        console.log('generated to:', outpath);
        buf += postface || '';
        if (_minify) {
            buf = minify(buf);
        }
        fs.writeFile(outpath, buf);
    }

    return {
        preface: function(p) {
            buf = p;
        },
        minify: function(on) {
            if (on) {
                _minify = true;
            }
        },
        job: function(key) {
            console.log('read file:', key);
            jobs[key] = num++;
        },
        end: function(_postface) {
            finding = false;
            postface = _postface;
            if (!num) {
                write();
            }
        },
        done: function(key, data) {
            delete jobs[key];
            num--;
            
            buf += data;
            if (!finding && !num) {
                write();
            }
        }
    };
})();

fs.readdir(inpath, function(e, files) {
    if (e)
        throw e;

    writer.preface('(function(t){TEMPLATES={');
    writer.minify(argv.release);

    files.forEach(function(file) {
        var _path = path.join(inpath, file);
        writer.job(_path);

        fs.readFile(_path, 'utf8', function(err, code) {
            var key = file.replace(/\.[^\.]*$/, '');
            code = code.replace(/[\r\n]\s*/g, '');
            writer.done(_path, "'" + key + "':new t(" + hogan.compile(code, { asString: true }) + "),");
        });
    });

    writer.end('}})(Hogan.Template);');
});
