interface GuestbookDAO {
    addGuest(firstName: string, lastName: string): void;
    getEntries():any
}
