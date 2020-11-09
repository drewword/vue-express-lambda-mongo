import { MongoClient } from "mongodb";
import { NIL, v4 as uuidv4 } from 'uuid';

import * as fs from "fs";

export class MongoDAO implements GuestbookDAO {

    cachedDb:MongoClient;
    
    async addGuest(firstName: string, lastName: string) {
        console.log ("Adding guest:" + firstName + " " + lastName);
        const collection = await this.getBaseCollection();
        console.log ("Collection: " + collection);
        const result = await collection.insertOne({_id: uuidv4(), 
                                firstName: firstName, 
                                lastName: lastName});
        console.log ("Inserted record count: " + result.insertedCount);
        return Promise.resolve();   
    }

    async getBaseCollection() {
        const mongoClient = await this.connectToDatabase() as MongoClient;
        const database = mongoClient.db("guestbook-db");        // DB
        const collection = database.collection("signed-users"); // Table
        return Promise.resolve(collection);
    }

    async getEntries() {
        const collection = await this.getBaseCollection();
        var cursor = collection.find();
        var results = await cursor.toArray();
        console.log ("Results of get entries from mongo: " + JSON.stringify(results));
        return Promise.resolve({logbook:results});
    }

    async connectToDatabase() {
        console.log ("Connecting to mongo database.");
        if (this.cachedDb && this.cachedDb.isConnected() ) {
            return Promise.resolve(this.cachedDb);
        }
    
        let mongoUser = process.env.MONGO_USER || "";
        let mongoPass = process.env.MONGO_PASS || "";
    
        let caContent = fs.readFileSync('./rds-bundle.pem');
        let theCAFile = [caContent];

        let mongoOptions  = {
            ssl: true,
            connectTimeoutMS:15000,
            sslValidate: false,
            sslCA: theCAFile,
            useNewUrlParser: true,
            useUnifiedTopology: true
        };
    
        let mongoUri = "mongodb://" + mongoUser + ":" + 
            mongoPass + "@" + process.env.MONGODB_URI + "/&ssl=true"  || "";
    
        return MongoClient.connect(mongoUri,mongoOptions).then(db => {
                this.cachedDb = db;
                return this.cachedDb;
            }).catch( reason => {
                console.log ("Oh snap! no connection");
                console.log (reason);
        });
    }

}