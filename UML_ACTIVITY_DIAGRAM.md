# Stock Management UML Activity Diagram

This diagram captures the high-level business activity flow implemented in the current `stock_management` system.

```mermaid
flowchart TD
    A([Start]) --> B[User opens system and enters credentials]
    B --> C{Valid credentials?}
    C -->|No| D[Show authentication error]
    D --> B
    C -->|Yes| E[Generate session/JWT and load user role]
    E --> F{Role identified?}
    F -->|ADMIN| G[Grant full operational access]
    F -->|MANAGER| H[Grant management access]
    F -->|STAFF| I[Grant operational access]

    G --> J[Choose business activity]
    H --> J
    I --> J

    J --> K{Selected activity}

    K -->|Maintain master data| L[Create or update category, supplier, or product]
    L --> M{Is it a new product?}
    M -->|Yes| N[Initialize inventory record with zero stock]
    M -->|No| O[Save updated master data]
    N --> P[Master data setup completed]
    O --> P
    P --> Z[Return to main operations]

    K -->|Inventory adjustment| Q[Enter stock in or stock out details]
    Q --> R{Quantity valid and greater than zero?}
    R -->|No| S[Reject request and show validation failure]
    S --> Z
    R -->|Yes| T{Adjustment type}
    T -->|Stock In| U[Increase inventory quantity]
    T -->|Stock Out| V{Sufficient stock available?}
    V -->|No| W[Reject stock-out request]
    W --> Z
    V -->|Yes| X[Decrease inventory quantity]
    U --> Y[Record stock transaction]
    X --> Y
    Y --> AA[Evaluate low-stock, out-of-stock, and expiry conditions]
    AA --> AB[Refresh dashboard, alerts, and reports]
    AB --> Z

    K -->|Order processing| AC[Create purchase or sales order]
    AC --> AD{Order has at least one item and valid quantities?}
    AD -->|No| AE[Reject order creation]
    AE --> Z
    AD -->|Yes| AF[Save order with pending status]
    AF --> AG{Confirm order?}
    AG -->|No| AH[Keep pending or cancel order]
    AH --> Z
    AG -->|Yes| AI{Order type}
    AI -->|PURCHASE| AJ[Increase inventory for each order item]
    AI -->|SALES| AK{Sufficient stock for each item?}
    AK -->|No| AL[Reject confirmation due to insufficient stock]
    AL --> Z
    AK -->|Yes| AM[Decrease inventory for each order item]
    AJ --> AN[Record stock transactions and mark order confirmed]
    AM --> AN
    AN --> AO[Evaluate low-stock, out-of-stock, and expiry conditions]
    AO --> AP[Update dashboard, alerts, and reports]
    AP --> Z

    Z --> AQ{Continue using system?}
    AQ -->|Yes| J
    AQ -->|No| AR([End])
```

## Validation Coverage

- Admin can log in and maintain categories, suppliers, and products.
- New product creation includes automatic inventory initialization.
- Manager can create and confirm purchase orders that increase stock.
- Staff can create and confirm sales orders that decrease stock.
- Sales and stock-out operations fail when stock is insufficient.
- Inventory changes trigger low-stock or out-of-stock evaluation.
- Expiring products feed the expiry alert path.
- Dashboard, alerts, and reports consume the updated inventory and transaction state.
