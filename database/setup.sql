CREATE DATABASE IF NOT EXISTS zingalinga;
USE zingalinga;

CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100),
    role ENUM('user', 'admin') DEFAULT 'user',
    password VARCHAR(255) NOT NULL,
    purchasedModules JSON,
    totalSpent DECIMAL(10,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'active',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    lastLogin DATETIME
);

CREATE TABLE modules (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    category VARCHAR(100),
    tags JSON,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE purchases (
    id VARCHAR(50) PRIMARY KEY,
    userId VARCHAR(50),
    moduleId VARCHAR(50),
    amount DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'completed',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (moduleId) REFERENCES modules(id)
);

INSERT INTO users (id, email, name, role, password) VALUES 
('admin-1', 'admin@zingalinga.com', 'Admin', 'admin', 'admin123');