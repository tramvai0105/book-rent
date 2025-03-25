import mysql from 'mysql2/promise';
import bcrypt from "bcryptjs"

async function init() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: '1234',
        database: 'book',
        waitForConnections: true,
        connectionLimit: 10,
        maxIdle: 10,
        idleTimeout: 60000,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
    });

    try {
        await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
            id INT PRIMARY key AUTO_INCREMENT ,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            balance DECIMAL(10, 2) DEFAULT 0,
            frozenBalance DECIMAL(10, 2) DEFAULT 0,
            withdrawnBalance DECIMAL(10, 2) DEFAULT 0,
            verificated BOOLEAN DEFAULT FALSE,
            name VARCHAR(100) DEFAULT '',
            city VARCHAR(100) DEFAULT '',
            avatarUrl VARCHAR(255) DEFAULT 'avatarDefault.jpg',
            contactInfo VARCHAR(255) DEFAULT '',
            description TEXT DEFAULT NULL,
            recovery_code VARCHAR(6) DEFAULT NULL,
            role ENUM('user', 'moderator') DEFAULT 'user',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
        );
        `);

        const email = 'admin@gmail.com';
        const _password = 'admin'
        const password = await bcrypt.hash(_password, 10);
        const name = 'admin@gmail.com';
        const role = 'moderator';
        const verificated = 1;
        const balance = 10000;

        await pool.query(`
            INSERT INTO users (email, password, name, role, verificated, balance)
            SELECT ?, ?, ?, ?, ?, ?
            WHERE NOT EXISTS (
                SELECT 1 FROM users WHERE email = ?
            )
        `, [email, password, name, role, verificated, balance, email]);

        await pool.query(`CREATE TABLE IF NOT EXISTS transactions (
            id INT PRIMARY KEY AUTO_INCREMENT,
            fromUserId INT NOT NULL,
            toUserId INT NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            transactionType ENUM('user_to_user', 'user_to_service', 'service_to_user') NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (fromUserId) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (toUserId) REFERENCES users(id) ON DELETE CASCADE
        );`)

        await pool.query(`
            CREATE TABLE IF NOT EXISTS Books (
                id INT PRIMARY KEY AUTO_INCREMENT,
                title VARCHAR(255) NOT NULL,
                author VARCHAR(255) NOT NULL,
                publicationYear INT,
                genre VARCHAR(255) NOT NULL,
                wealth TEXT,
                photoUrls JSON,
                description TEXT,
                userId INT NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
        CREATE TABLE IF NOT EXISTS verifications(
            email VARCHAR(255) NOT NULL UNIQUE,
            code VARCHAR(10) NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY(email)
        );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS Listings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                bookId INT NOT NULL,
                userId INT NOT NULL,
                interactionType ENUM('rent', 'sale', 'both') NOT NULL,
                rentPricePerMonth DECIMAL(10, 2),
                salePrice DECIMAL(10, 2),
                deposit DECIMAL(10, 2),
                address VARCHAR(255) NOT NULL,
                city VARCHAR(255) NOT NULL, 
                phoneNumber VARCHAR(255) NOT NULL,
                deliveryMethod ENUM('meetup', 'post') NOT NULL,
                status ENUM('pending', 'process', 'approved', 'rejected', 'closed') NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS Rentals (
                id INT AUTO_INCREMENT PRIMARY KEY,
                listingId INT NOT NULL,
                renterId INT NOT NULL,
                startDate DATE NOT NULL,
                endDate DATE,
                total DECIMAL(10, 2) DEFAULT 0,
                status ENUM('pending', 'active', 'returnRequest', 'extendRequest', 'completed', 'cancelled') NOT NULL,
                deliveryTrackingNumber VARCHAR(255),
                returnTrackingNumber VARCHAR(255),
                penalty DECIMAL(10, 2),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS Purchases (
                id INT AUTO_INCREMENT PRIMARY KEY,
                listingId INT NOT NULL,
                buyerId INT NOT NULL,
                purchaseDate DATE NOT NULL,
                deliveryTrackingNumber VARCHAR(255),
                status ENUM('pending', 'completed', 'cancelled') NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS Reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                reviewerId INT NOT NULL,
                reviewedUserId INT NOT NULL,
                listingId INT NOT NULL,
                rating INT CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`CREATE TABLE IF NOT EXISTS deposits (
            id INT PRIMARY KEY AUTO_INCREMENT,
            amount DECIMAL(10, 2) NOT NULL,
            renterId INT NOT NULL,
            listingId INT NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (renterId) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (listingId) REFERENCES Listings(id) ON DELETE CASCADE
        );`)

        await pool.query(`
            CREATE TABLE IF NOT EXISTS Chats (
                id INT AUTO_INCREMENT PRIMARY KEY,
                participants JSON NOT NULL,
                listingId INT NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS ChatMessages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                senderId INT NOT NULL,
                receiverId INT NOT NULL,
                chatId INT NOT NULL,
                message TEXT NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (senderId) REFERENCES Users(id),
                FOREIGN KEY (receiverId) REFERENCES Users(id),
                FOREIGN KEY (chatId) REFERENCES Chats(id)
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS Penaltys (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT NOT NULL,
                rentalId INT NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                reason TEXT NOT NULL,
                status ENUM('pending', 'paid', 'cancelled') NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS Notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT NOT NULL,
                message TEXT NOT NULL,
                type ENUM('rental_request', 'rental_confirmation', 'rental_completion', 'penalty', 'new_message') NOT NULL,
                isRead BOOLEAN DEFAULT FALSE,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS Moderations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                listingId INT NOT NULL,
                moderatorId INT NOT NULL,
                status ENUM('pending', 'approved', 'rejected') NOT NULL,
                rejectionReason TEXT,
                moderatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS Genres (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS ActivityLogs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT NOT NULL,
                action VARCHAR(255) NOT NULL,
                details TEXT,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS ReturnIssues (
                id INT AUTO_INCREMENT PRIMARY KEY,
                rentalId INT NOT NULL,
                description TEXT NOT NULL,
                photoUrls JSON,
                status ENUM('pending', 'resolved') NOT NULL,
                resolvedByModeratorId INT,
                resolvedAt TIMESTAMP,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

    } catch (error) {
        console.error('Ошибка при инициализации базы данных:', error);
    }

    return pool;
}

let db = await init();
export default db;