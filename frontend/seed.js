import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8080/api' });

const generateExpiry = () => {
  const d = new Date();
  d.setDate(d.getDate() + Math.floor(Math.random() * 90) - 10);
  return d.toISOString().split('T')[0];
};

const seed = async () => {
  try {
    console.log('Logging in as admin...');
    const authRes = await api.post('/auth/login', { username: 'admin', password: 'admin123' });
    const token = authRes.data.token;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const uid = Math.random().toString(36).substring(7);

    console.log('Creating 10 Categories...');
    const catNames = [
      'Electronics', 'Home Appliances', 'Office Supplies', 'Furniture', 
      'Apparel', 'Footwear', 'Groceries', 'Beverages', 'Toys', 'Sports Equipment'
    ];
    const categories = [];
    for (const name of catNames) {
      const res = await api.post('/categories', { name: `${name} ${uid}`, description: `${name} category description` });
      categories.push(res.data);
    }

    console.log('Creating 10 Suppliers...');
    const suppliers = [];
    for (let i = 1; i <= 10; i++) {
      const res = await api.post('/suppliers', {
        name: `Global Tech Supplier ${i} ${uid}`,
        contactPerson: `Contact Person ${i}`,
        email: `supplier${i}_${uid}@example.com`,
        phone: `+1-555-${uid.substring(0,3)}${i}`,
        address: `${i}00 Business Rd, Techville, TX 75001`
      });
      suppliers.push(res.data);
    }

    console.log('Creating 20 Products...');
    const products = [];
    for (let i = 1; i <= 20; i++) {
      const cat = categories[Math.floor(Math.random() * categories.length)];
      const sup = suppliers[Math.floor(Math.random() * suppliers.length)];
      
      const cost = Math.floor(Math.random() * 500) + 10;
      const price = Math.floor(cost * (1.2 + Math.random()));
      
      const res = await api.post('/products', {
        name: `${cat.name} Item ${i}00X`,
        sku: `${cat.name.substring(0, 3).toUpperCase()}-${i}00X-${uid}`,
        description: `High quality ${cat.name} item from ${sup.name}`,
        price: price,
        costPrice: cost,
        reorderLevel: Math.floor(Math.random() * 15) + 5,
        expiryDate: i % 4 === 0 ? generateExpiry() : null, // 25% have expiry
        categoryId: cat.id,
        supplierId: sup.id
      });
      products.push(res.data);
    }

    console.log('Adding 20 Inventory Stock-In Transactions...');
    for (const p of products) {
      if (!p || !p.id) {
         console.warn('Skipping stock in, product is invalid:', p);
         continue;
      }
      const qty = Math.floor(Math.random() * 80) + 1; // 1 to 80
      await api.post('/inventory/stock-in', {
        productId: p.id,
        quantity: qty,
        notes: 'Initial Bulk Stock In'
      });
    }

    console.log(`Successfully created ${products.length} products.`);
    console.log('Sample product:', products[0]);

    console.log('Creating 20 Orders (Sales and Purchases)...');
    for (let i = 1; i <= 20; i++) {
        const type = i % 3 === 0 ? 'PURCHASE' : 'SALES';
        
        // pick 2 random products
        const p1 = products[Math.floor(Math.random() * products.length)];
        const p2 = products[Math.floor(Math.random() * products.length)];
        
        if (!p1 || !p2 || !p1.id || !p2.id) {
            console.warn('Skipping order due to invalid product mapping', { p1Id: p1?.id, p2Id: p2?.id });
            continue;
        }

        const q1 = Math.floor(Math.random() * 5) + 1;
        const q2 = Math.floor(Math.random() * 5) + 1;

        try {
            const res = await api.post('/orders', {
                orderType: type,
                notes: `${type} Order #${i} generated automatically`,
                items: [
                    { productId: p1.id, quantity: q1, unitPrice: type === 'SALES' ? p1.price : p1.costPrice },
                    { productId: p2.id, quantity: q2, unitPrice: type === 'SALES' ? p2.price : p2.costPrice }
                ]
            });

            // Arbitrarily confirm half of the orders, only if PURCHASE (to avoid insufficient stock)
            if (i % 2 === 0 && type === 'PURCHASE') {
                await api.put(`/orders/${res.data.id}/confirm`);
            }
        } catch (postErr) {
            console.error(`Order failed on iteration ${i}:`, postErr.response?.data?.message || postErr.message);
        }
    }

    console.log('✅ Mock Data Seeding Complete!');
  } catch (err) {
    console.error('❌ Error seeding data:', err.response?.data || err.message);
  }
};

seed();
