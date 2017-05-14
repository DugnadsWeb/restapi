const db = require('./neo4j_db')();



query = [
  "CREATE CONSTRAINT ON (n:User) ASSERT n.email IS UNIQUE",
  "CREATE CONSTRAINT ON (n:Activity) ASSERT n.uuid IS UNIQUE",
  "CREATE CONSTRAINT ON (n:Organization) ASSERT n.uuid IS UNIQUE",
  "CREATE CONSTRAINT ON (n:Dugnad) ASSERT n.uuid IS UNIQUE",
  "CREATE CONSTRAINT ON (n:SalesActivity) ASSERT n.uuid IS UNIQUE"
];

promises = [];
var session = db.session();
for (let i=0;i<query.length;i++){
  promises.push(session.run(query[i]));
}
Promise.all(promises)
  .then(() => {
    session.close;
    process.exit(0);
  })
  .catch(err => {
    console.log(err)
    process.exit(1);
  });
