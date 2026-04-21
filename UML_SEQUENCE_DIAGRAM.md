# Stock Management UML Sequence Diagram

This sequence diagram shows the main interaction flow between the user, frontend, backend services, and database for the stock management system.

```mermaid
sequenceDiagram
    actor User
    participant UI as Frontend UI
    participant Auth as Auth Service
    participant Product as Product Service
    participant Order as Order Service
    participant Inventory as Inventory Service
    participant Alert as Alert/Report Layer
    participant DB as Database

    User->>UI: Enter username and password
    UI->>Auth: login(credentials)
    Auth->>DB: validate user and role
    DB-->>Auth: user details
    Auth-->>UI: JWT token + role
    UI-->>User: Access granted

    alt Admin/Manager manages master data
        User->>UI: Create or update category/supplier/product
        UI->>Product: save product data
        Product->>DB: store category/supplier/product
        alt New product created
            Product->>DB: create inventory record with quantity = 0
        end
        Product-->>UI: master data saved
        UI-->>User: show success
    end

    alt Staff/Manager performs direct inventory adjustment
        User->>UI: Submit stock in/out request
        UI->>Inventory: stockIn() / stockOut()
        Inventory->>Inventory: validate quantity
        alt Stock out
            Inventory->>DB: fetch current inventory
            DB-->>Inventory: current quantity
            Inventory->>Inventory: check sufficient stock
        end
        alt Validation failed
            Inventory-->>UI: error message
            UI-->>User: show validation failure
        else Validation passed
            Inventory->>DB: update inventory quantity
            Inventory->>DB: record stock transaction
            Inventory->>Alert: trigger alert/report refresh
            Alert->>DB: read inventory and transaction state
            Alert-->>UI: updated alerts/dashboard/report data
            UI-->>User: show updated stock state
        end
    end

    alt Staff/Manager processes order
        User->>UI: Create purchase or sales order
        UI->>Order: createOrder(order data)
        Order->>Order: validate items and quantities
        alt Invalid order
            Order-->>UI: order validation error
            UI-->>User: show error
        else Valid order
            Order->>DB: save pending order and order items
            Order-->>UI: pending order created
            User->>UI: Confirm order
            UI->>Order: confirmOrder(orderId)
            Order->>DB: fetch order and inventory
            alt Purchase order
                Order->>DB: increase inventory for each item
                Order->>DB: record IN transactions
            else Sales order
                Order->>Order: verify sufficient stock
                alt Insufficient stock
                    Order-->>UI: confirmation rejected
                    UI-->>User: show insufficient stock
                else Stock available
                    Order->>DB: decrease inventory for each item
                    Order->>DB: record OUT transactions
                end
            end
            Order->>DB: mark order confirmed
            Order->>Alert: trigger alert/report refresh
            Alert->>DB: read latest inventory, alerts, and reports
            Alert-->>UI: refreshed business status
            UI-->>User: show confirmed result
        end
    end

    User->>UI: View dashboard / alerts / reports
    UI->>Alert: request operational summary
    Alert->>DB: fetch inventory, order, and transaction metrics
    DB-->>Alert: summary data
    Alert-->>UI: dashboard/alert/report response
    UI-->>User: display business insights
```

## Purpose

- Shows how the user interacts with the frontend and backend services.
- Shows where validation happens before inventory changes.
- Shows how product creation initializes inventory.
- Shows how purchase and sales orders affect stock differently.
- Shows how alerts, dashboard data, and reports are refreshed after stock movement.
