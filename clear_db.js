const db = require('./neo4j_db')();

// This is just a script to help with development,
// not a part if the final application.

function clear(callback) {
  let session = db.session()
  session.run("MATCH (a) DETACH DELETE a")
  .then(() => {
    session.close();
    callback();
  })
  .catch((err) => {
    console.log(err);
  });
}

for (var i=0; i<process.argv.length;i++) {
  switch (process.argv[i]) {
    case '-r':
      clear(() => { process.exit(0)});
      break;
  }
}

module.exports = clear;
