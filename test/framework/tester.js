const fs = require('fs');
const pth = require('path');


var Tester = function(){

  // propertied
  this.tests = [];

  // overridable callback methods
  this.beforeEach = () => {};
  this.afterEach = () => {};
  this.after = () => {};

  // local vars
  var time = new Date();

  // public methods
  this.run = run;
  this.addTest = addTest;
  this.generateReport = generateReport;
  this.writeLogFile = writeLogFile;

  // starts the tests
  function run(){
    let start_time = time.getTime();

    for (let i=0;i<this.tests.length;i++){
      this.beforeEach();
      doTest(this.tests[i]);
      this.afterEach();
    }
  }

  // adds a test case to the tester
  function addTest(test){
    test.result = {};
    this.tests.push(test);
  }

  // makes a promise to test
  function doTest(test){
    return 
      let test_start = time.getTime();
      try {
        console.log('starting test');
        test.test();
        test.result.status = true;
        test.result.message = 'Test passed as expected';
        test.result.elapsed_time = test_start-time.getTime();
      }
      catch(err){
        test.result.status = false;
        test.result.message = err;
        test.result.elapsed_time = test_start-time.getTime();
      };
  }

  // generates the output text
  function generateReport() {
    let t = time;
    let output = 'Date: ' + t.getDate() + '/' + (t.getMonth()+1) +
      '/' + t.getYear() + ':' + t.getHours() + '.' + t.getMinutes() +
      '.' + t.getSeconds() + '\n';
    let success = 'Following tests passed:\n';
    let fail = 'Following tests failed:\n';
    let not_ran = 'Following tests did not run:\n'
    for (var i=0;i<this.tests.length;i++){
      let test = this.tests[i];
      console.log(test);
      if (test.result.status == true){ // ifsucceeded
        success += '\t' + (i+1) + ') ' + test.lable + '\n';
        success += '\t\tShould ' + test.should + ', and did.\n';
      } else if (test.result.status == false){ // if failed
        fail += '\t' + (i+1) + ') ' + test.lable + '\n';
        fail += '\t\tShould ' + test.should + '\n';
        fail += '\t\tMessage: ' + test.result.message + '\n'
      } else { // not ran
        not_ran += '\t' + (i+1) + ') ' + test.lable + '\n';
        not_ran += '\t\tShould ' + test.should + ', but was not executed.\n';
      }
    }
    return output + success + fail + not_ran;
  }

  // TODO create directory if not exists
  function writeLogFile(location){
    let t = time;
    let fnumber = 1
    let path = pth.resolve(__dirname, location + fnumber.toString() + '.log');
    while(fs.existsSync(path)){
      fnumber++;
      path = pth.resolve(__dirname, location + fnumber.toString() + '.log');
    }
    ws = fs.createWriteStream(path, {flags: 'w', fd: null, autoClose:true});
    ws.on('error', function(e) { console.error(e); });
    ws.path.basename
    ws.write(this.generateReport());
    ws.end();
  }


// end of Tester
}

module.exports = Tester;
