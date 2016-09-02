var fs = require('fs'),
    path = require('path');

describe('linkedin-pdf-to-json', function() {

    var actualDir, baseDir, expectedDir;

    beforeEach(function() {
        dir = path.dirname(__filename);
        var baseDir = path.normalize(dir + '/..');
        expectedDir = baseDir + '/expected/';
        actualDir = baseDir + '/actual/';
    });

    it('should store parsed text in JSON format as expected', function(done) {
        fs.readdir(actualDir, function(err, files) {
            if (err) {
                throw err;
            }

            if (files[0] === '.DS_Store') {
                profiles = files.slice(1);
            }
            for (var i = 0; i < files.length; i++) {
                var actualFile = actualDir + files[i];
                var expectedFile = expectedDir + files[i];
                var stat;
                try {
                    stat = fs.statSync(expectedFile);
                    var actualData = fs.readFileSync(actualFile);
                    var expectedData = fs.readFileSync(expectedFile);
                    expect(actualData).toEqual(expectedData);
                } catch (e) {
                    if (e.code === 'ENOENT') {
                        continue;
                    }
                }
            }
            done();
        });
    }, 2000);
});
