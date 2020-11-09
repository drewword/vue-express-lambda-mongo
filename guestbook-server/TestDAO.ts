export class TestDAO implements GuestbookDAO {

    logBook:Array<any>;

    constructor() {
        this.logBook = [];
    }

    async addGuest(firstName: string, lastName: string) {
        console.log ("Test DAO adding Guest.");
        this.logBook.push({firstName: firstName, lastName: lastName});
        return Promise.resolve();
    }
    
    async getEntries() {
        console.log ("Test DAO getting entries.");
        return Promise.resolve({logbook:this.logBook});
    }
}
