export class CartItem {
    bookID: number;
    buyer: string;

    constructor(bookID: number, buyer: string){
        this.bookID = bookID;
        this.buyer = buyer;
    }
}