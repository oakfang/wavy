var fs = require('fs');
var exec = require('child_process').exec;
var path = require('path');

var testDir = path.resolve(__dirname + '/test-dir');

if (fs.existsSync(testDir)) {
  deleteFolderRecursive(testDir);
}

fs.mkdirSync(testDir);
fs.writeFileSync(testDir + '/package.json', '{}');
fs.writeFileSync(testDir + '/index.js', 'console.log(require("~/foo"))');
fs.writeFileSync(testDir + '/foo.js', 'module.exports = "foo";');

exec('npm install ..', { cwd: testDir }, function(err) {
  handleError(err);
  exec('node index', { cwd: testDir }, function(err, stdout) {
    if (stdout.trim() !== 'foo') {
      handleError(new Error('expected output to be "foo" got ' + stdout.trim()));
    }
    deleteFolderRecursive(testDir);
    console.log('test passed!');
  });
});

function handleError(err) {
  if (err) {
    deleteFolderRecursive(testDir);
    console.error(err.stack);
    process.exit(1);
  }
}

// http://stackoverflow.com/a/12761924
function deleteFolderRecursive(path) {
  var files = [];
  if(fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};
