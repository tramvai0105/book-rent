import { Book, Listing } from "./models";

type BookFields = Pick<Book, 'title' | 'author'>;
type ListingFields = Pick<Listing, 'interactionType' | 'rentPricePerMonth' | 'salePrice' | 'city'>;

export interface BookCardData extends BookFields, ListingFields {
    id: string,
    img: string;
}

export interface BookData {
    id: number,
    title: string,
    img: string,
    sellerName: string,
    phoneNumber: string,
    city: string,
    description: string,
    author: string,
    publicationYear: number,
    genre: string,
    deposit: number,
    salePrice: number,
    rentPrice: number,
}

export interface ListingData {
    id: number;
    title: string,
    img: string,
    description: string,
    author: string,
    publicationYear: number,
    genre: string,
    wealth: string,
    interactionType: 'rent' | 'sale' | 'both';
    rentPricePerMonth?: number;
    salePrice?: number;
    deposit: number,
    phoneNumber: string,
    address: string,
    deliveryMethod: 'meetup' | 'post';
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
}
