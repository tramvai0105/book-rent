export interface User {
    id: number;
    email: string;
    password: string;
    balance: number,
    name: string;
    city: string;
    avatarUrl?: string;
    contactInfo: string;
    description?: string;
    role: 'user' | 'moderator';
    createdAt: Date;
    updatedAt: Date;
}

export interface Book {
    id: number;
    title: string;
    author: string;
    publicationYear?: number;
    genre: string;
    wealth: string;
    photoUrls: string[];
    description?: string;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Transaction {
    id: number;
    fromUserId: number;
    toUserId: number;
    amount: number;
    transactionType: 'user_to_user' | 'user_to_service' | 'service_to_user';
    createdAt: Date;
    updatedAt: Date;
}

export interface Deposit {
    id: number; 
    amount: number;
    renterId: number;
    listingId: number; 
    createdAt: Date;
    updatedAt: Date;
}

export interface Listing {
    id: number;
    bookId: number;
    userId: number;
    interactionType: 'rent' | 'sale' | 'both';
    rentPricePerMonth?: number;
    salePrice?: number;
    deposit: number,
    phoneNumber: string,
    address: string,
    city: string,
    deliveryMethod: 'meetup' | 'post';
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
}

export interface Rental {
    id: number;
    listingId: number;
    renterId: number;
    startDate: Date;
    endDate: Date;
    status: 'pending' | 'active' | "returnRequest" | 'completed' | 'cancelled';
    deliveryTrackingNumber?: string;
    returnTrackingNumber?: string;
    penalty?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Purchase {
    id: number;
    listingId: number;
    buyerId: number;
    purchaseDate: Date;
    deliveryTrackingNumber?: string;
    status: 'pending' | 'completed' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}

export interface Review {
    id: number;
    reviewerId: number;
    reviewedUserId: number;
    listingId: number;
    rating: number;
    comment?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ChatMessage {
    id: number;
    senderId: number;
    receiverId: number;
    listingId: number;
    message: string;
    createdAt: Date;
}

export interface Chat {
    id: number;
    participants: number[];
    messages: ChatMessage[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Penalty {
    id: number;
    userId: number;
    rentalId: number;
    amount: number;
    reason: string;
    status: 'pending' | 'paid' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}

export interface Notification {
    id: number;
    userId: number;
    message: string;
    type: 'rental_request' | 'rental_confirmation' | 'rental_completion' | 'penalty' | 'new_message';
    isRead: boolean;
    createdAt: Date;
}

export interface Moderation {
    id: number;
    listingId: number;
    moderatorId: number;
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    moderatedAt: Date;
}

export interface Genre {
    id: number;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ActivityLog {
    id: number;
    userId: number;
    action: string;
    details?: string;
    createdAt: Date;
}

export interface Deposit {
    id: number;
    rentalId: number;
    amount: number;
    status: 'pending' | 'returned' | 'forfeited';
    createdAt: Date;
    updatedAt: Date;
}

export interface ReturnIssue {
    id: number;
    rentalId: number;
    description: string;
    photoUrls: string[];
    status: 'pending' | 'resolved';
    resolvedByModeratorId?: number;
    resolvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}