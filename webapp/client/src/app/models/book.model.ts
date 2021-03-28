export class Book {
    id: number;
    title: string;
    authors: string;
    ISBN: string;
    publication_date: string;
    quantity: number;
    price: number;
    owner: string;
    images: File[];
    image_names: string;
    image_tokens: string[];

    constructor(title: string, authors: string, ISBN: string, 
        publication_date: string, quantity: number, price: number, owner: string, images: File[]){
            this.title = title;
            this.authors = authors;
            this.ISBN = ISBN;
            this.publication_date = publication_date;
            this.quantity = quantity;
            this.price = price;
            this.owner = owner;
            this.images = images;
            this.image_tokens = [];
        }

}