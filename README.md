# StockFlow: Advanced Inventory Management System

StockFlow is a full-stack, automated Inventory and Stock Management System built to help businesses effortlessly track their products, manage suppliers, monitor stock levels, and securely handle sales and purchase orders. 

---

## 🚀 Core Features & What It Does

### 1. Role-Based Access Control (RBAC) & User Management
The system is deeply secure, offering three distinct layers of access:
* **Admin:** Full access to everything. Can create/delete users, assign roles, view all financials, and manage the system centrally.
* **Manager:** Can view reports, manage products, categories, suppliers, and handle orders, but cannot delete records or manage staff accounts.
* **Staff:** Basic access. Can view inventory and process standard orders, but restricted from sensitive financial data and destructive actions.

### 2. Product & Catalog Management
* **Products:** Track items with details like SKU, pricing, cost, and reorder levels.
* **Categories:** Organize products logically (e.g., "Electronics", "Hardware"). Automatically cascades soft-deletion to its products if the category is removed.
* **Suppliers:** Keep a rolodex of who provides what. Removing a supplier does not destroy historical product data.
* **Soft-Deletion System:** When items (products, suppliers, categories) are deleted, they are safely entirely hidden from the UI using `active=false` flags rather than aggressively wiping database records, preserving historical order integrity.

### 3. Inventory & Order Processing
* **Sales Orders (Stock Out):** When a customer buys products, it seamlessly deducts stock from the current inventory. Prevents sales if stock drops below zero.
* **Purchase Orders (Stock In):** When a business buys from a supplier, it automatically adds the purchased quantity into the warehouse stock upon confirmation.
* **Low Stock Alerts:** Automatically calculates dynamically against each product's custom "Reorder Level".

### 4. Interactive Analytics Dashboard
* View total calculated Inventory Value.
* Monitor recent monthly sales vs. purchases.
* Quick-glance widgets for Low Stock and Out of Stock urgent items.

---

## 🛠️ Technology Stack Built

### **Backend** (REST API)
* **Java 17** & **Spring Boot 3.2**: The core framework providing a robust, highly-concurrent architecture.
* **Spring Data JPA & Hibernate**: Handles all Object-Relational Mapping (ORM) to the database.
* **Spring Security & JWT**: Manages purely stateless, secure authentication tokens.
* **MySQL 8**: Relational database for pure data integrity and ACID properties.

### **Frontend** (Single Page Application)
* **React 18**: Component-based UI library.
* **Material UI (MUI)**: Sleek, responsive, Google-styled component aesthetics.
* **React Router**: For seamless client-side page routing and Role Guards.
* **Axios**: HTTP client intercepting tokens and talking to the Spring Boot REST API.
* **Notistack**: Toast notifications for instant feedback during operations.

---

## 🚦 Getting Started

### Prerequisites
* Java 17+
* Node.js 18+
* MySQL 8+ 

### 1. Backend Setup
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
*(Note: At startup, the backend `DataInitializer` will automatically seed default accounts and dummy testing orders into your database!)*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Default Seeded Credentials
- **Admin:** `admin` / `admin123`
- **Manager:** `manager` / `manager123`
- **Staff:** `staff` / `staff123`

---
*Built as a professional, scalable template for modern business inventory operations.*
