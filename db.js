const mongoClient = require('mongodb').MongoClient;

let mongodb;

function connect(callback){
    mongoClient.connect(process.env.DATABASE, { useNewUrlParser: true }, (err, db) => {
        mongodb = db;
        callback();
    });
}
function get(){
    return mongodb.db();
}

function close(){
    mongodb.close();
}

module.exports = {
    connect,
    get,
    close
};
