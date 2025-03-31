import { Book, Listing } from "./models";

type BookFields = Pick<Book, 'title' | 'author' | 'publicationYear'>;
type ListingFields = Pick<Listing, 'interactionType' | 'rentPricePerMonth' | 'salePrice' | 'city'>;

export interface BookCardData extends BookFields, ListingFields {
    id: string,
    img: string;
}

export interface BookData {
    id: number,
    title: string,
    img: string[],
    sellerName: string,
    interactionType: 'rent' | 'sale' | 'both';
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
    img: string[],
    userId: string,
    sellerName: string,
    description: string,
    author: string,
    publicationYear: number,
    genre: string,
    wealth: string,
    interactionType: 'rent' | 'sale' | 'both';
    rentPricePerMonth?: number,
    salePrice?: number,
    deposit: number,
    phoneNumber: string,
    address: string,
    city: string,
    deliveryMethod: 'meetup' | 'post',
    status: 'pending' | 'approved' | 'process' | 'rejected' | 'closed',
    rejectionReason: string,
    createdAt: Date,
    updatedAt: Date,
}

export interface RentalAsLessor {
    rentalId: number;
    listingId: number;
    title: string;
    author: string;
    price: number;
    img: string;
    address: string;
    startDate: string;
    endDate: string;
    status: string;
    renterName: string;
}

export interface RentalAsRenter {
    rentalId: number;
    listingId: number;
    title: string;
    author: string;
    price: number;
    img: string;
    address: string;
    startDate: string;
    endDate: string;
    status: string;
    lessorName: string;
}

export interface Purchase {
    purchaseId: number;
    listingId: number;
    title: string;
    author: string;
    price: number;
    img: string;
    address: string;
    purchaseDate: string;
    status: string;
    sellerName: string;
}

export interface Sale {
    listingId: number;
    purchaseId: number;
    title: string;
    author: string;
    price: number;
    purchaseDate: string;
    img: string;
    address: string;
    buyerName: string;
}

export interface OrdersData {
    rentalsAsLessor: RentalAsLessor[];
    rentalsAsRenter: RentalAsRenter[];
    purchases: Purchase[];
    sales: Sale[];
}
