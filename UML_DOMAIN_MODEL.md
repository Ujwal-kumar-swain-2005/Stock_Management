# Stock Management Domain Model

## Conceptual Classes

The core conceptual classes in the stock management domain are:

- `User`: system actor who logs in and performs business operations.
- `Role`: classification of a user as `ADMIN`, `MANAGER`, or `STAFF`.
- `Category`: groups products into business-defined catalog types.
- `Supplier`: external party that provides products.
- `Product`: sellable or purchasable inventory item with SKU, pricing, reorder level, and optional expiry date.
- `Inventory`: current stock record maintained for exactly one product.
- `Order`: business transaction representing a purchase order or sales order.
- `OrderItem`: line item inside an order, linking a product to quantity and unit price.
- `OrderType`: identifies whether an order is `PURCHASE` or `SALES`.
- `OrderStatus`: lifecycle state of an order such as `PENDING`, `CONFIRMED`, or `CANCELLED`.
- `StockTransaction`: audit record of every stock movement.
- `TransactionType`: identifies whether stock moved `IN` or `OUT`.

## Domain Notes

- A `Product` belongs to one `Category` and may be associated with one `Supplier`.
- Each `Product` has one `Inventory` record that stores the current quantity on hand.
- A `User` creates `Order` records and may also perform stock transactions.
- An `Order` is composed of one or more `OrderItem` entries.
- Each `OrderItem` references exactly one `Product`.
- Confirmed purchase orders increase stock; confirmed sales orders decrease stock.
- `StockTransaction` preserves the history of stock movement for a `Product`.

## UML Class Diagram

```mermaid
classDiagram
    class User {
        +Long id
        +String username
        +String email
        +String fullName
        +boolean active
        +LocalDateTime createdAt
        +LocalDateTime updatedAt
    }

    class Role {
        <<enumeration>>
        ADMIN
        MANAGER
        STAFF
    }

    class Category {
        +Long id
        +String name
        +String description
        +boolean active
        +LocalDateTime createdAt
        +LocalDateTime updatedAt
    }

    class Supplier {
        +Long id
        +String name
        +String contactPerson
        +String email
        +String phone
        +String address
        +boolean active
        +LocalDateTime createdAt
        +LocalDateTime updatedAt
    }

    class Product {
        +Long id
        +String name
        +String sku
        +String description
        +BigDecimal price
        +BigDecimal costPrice
        +int reorderLevel
        +LocalDate expiryDate
        +String imageUrl
        +boolean active
        +LocalDateTime createdAt
        +LocalDateTime updatedAt
    }

    class Inventory {
        +Long id
        +int quantity
        +LocalDateTime lastUpdated
        +LocalDateTime createdAt
    }

    class Order {
        +Long id
        +String orderNumber
        +BigDecimal totalAmount
        +String notes
        +LocalDateTime orderDate
        +LocalDateTime createdAt
        +LocalDateTime updatedAt
    }

    class OrderType {
        <<enumeration>>
        SALES
        PURCHASE
    }

    class OrderStatus {
        <<enumeration>>
        PENDING
        CONFIRMED
        SHIPPED
        DELIVERED
        CANCELLED
    }

    class OrderItem {
        +Long id
        +int quantity
        +BigDecimal unitPrice
        +BigDecimal getSubtotal()
    }

    class StockTransaction {
        +Long id
        +int quantity
        +String referenceNumber
        +String notes
        +LocalDateTime transactionDate
        +LocalDateTime createdAt
    }

    class TransactionType {
        <<enumeration>>
        IN
        OUT
    }

    User --> Role : assigned
    Category "1" --> "0..*" Product : classifies
    Supplier "1" --> "0..*" Product : supplies
    Product "1" --> "1" Inventory : has stock record
    User "1" --> "0..*" Order : creates
    Order --> OrderType : typed as
    Order --> OrderStatus : has status
    Order "1" *-- "1..*" OrderItem : contains
    OrderItem "0..*" --> "1" Product : references
    Product "1" --> "0..*" StockTransaction : generates
    StockTransaction --> TransactionType : typed as
    User "0..1" --> "0..*" StockTransaction : performs
```

## Interpretation

- The domain centers on `Product`, because catalog setup, inventory, ordering, and stock history all depend on it.
- `Inventory` models the current stock state, while `StockTransaction` models the historical movement of stock.
- `Order` and `OrderItem` capture commercial activity, with type and status controlling how inventory is affected.
- `User` and `Role` represent authorization and accountability for operations in the system.
