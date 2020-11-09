import { MongoDAO } from './MongoDAO';
import {TestDAO} from './TestDAO';

export class DAOFactory {
    getDAO():GuestbookDAO {
        if ( process.env.LOCAL_MODE ) {
            console.log ("Using Test DAO.");
            return new TestDAO();
        }
        console.log ("Using MongoDB DAO.");
        return new MongoDAO();
    }
}