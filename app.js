// restaurant-service.js

const express = require('express');

const restaurantRouter = express.Router();

const restaurants = [];
 
restaurantRouter.post('/add', (req, res) => {

    const { id, name, menu } = req.body;

    if (!id || !name || !menu) {

        return res.status(400).json({ message: 'Invalid restaurant data' });

    }

    restaurants.push({ id, name, menu });

    res.status(201).json({ message: 'Restaurant added successfully' });

});
 
restaurantRouter.get('/:id', (req, res) => {

    const restaurant = restaurants.find(r => r.id === req.params.id);

    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    res.json(restaurant);

});
 
restaurantRouter.get('/', (req, res) => {

    res.json(restaurants);

});
 
module.exports = restaurantRouter;
 
// customer-service.js

const express = require('express');

const customerRouter = express.Router();

const customers = [];
 
customerRouter.post('/register', (req, res) => {

    const { id, name, preferences } = req.body;

    if (!id || !name) {

        return res.status(400).json({ message: 'Invalid customer data' });

    }

    customers.push({ id, name, preferences });

    res.status(201).json({ message: 'Customer registered successfully' });

});
 
customerRouter.get('/:id', (req, res) => {

    const customer = customers.find(c => c.id === req.params.id);

    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    res.json(customer);

});
 
customerRouter.put('/:id/preferences', (req, res) => {

    const customer = customers.find(c => c.id === req.params.id);

    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    customer.preferences = req.body.preferences;

    res.json({ message: 'Preferences updated successfully' });

});
 
module.exports = customerRouter;
 
// order-service.js

const express = require('express');

const orderRouter = express.Router();

const jwt = require('jsonwebtoken');

const orders = [];

const restaurants = require('./restaurant-service');

const customers = require('./customer-service');

const paymentGateway = require('./dummy-payment-gateway');
 
orderRouter.post('/place', (req, res) => {

    const { customerId, restaurantId, items, paymentInfo } = req.body;
 
    const customer = customers.find(c => c.id === customerId);

    if (!customer) return res.status(404).json({ message: 'Customer not found' });
 
    const restaurant = restaurants.find(r => r.id === restaurantId);

    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
 
    const paymentSuccess = paymentGateway.processPayment(paymentInfo);

    if (!paymentSuccess) return res.status(400).json({ message: 'Payment failed' });
 
    const order = { id: orders.length + 1, customerId, restaurantId, items, status: 'Placed' };

    orders.push(order);

    res.status(201).json({ message: 'Order placed successfully', order });

});
 
orderRouter.get('/history/:customerId', (req, res) => {

    const customerOrders = orders.filter(o => o.customerId === req.params.customerId);

    res.json(customerOrders);

});
 
orderRouter.get('/status/:id', (req, res) => {

    const order = orders.find(o => o.id === parseInt(req.params.id));

    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json({ status: order.status });

});
 
module.exports = orderRouter;
 
// auth-middleware.js

const jwt = require('jsonwebtoken');
 
const authenticate = (req, res, next) => {

    const token = req.headers['authorization'];

    if (!token) return res.status(401).json({ message: 'Access denied' });
 
    try {

        const decoded = jwt.verify(token, 'secretKey');

        req.user = decoded;

        next();

    } catch (err) {

        res.status(400).json({ message: 'Invalid token' });

    }

};
 
const authorize = (roles) => (req, res, next) => {

    if (!roles.includes(req.user.role)) {

        return res.status(403).json({ message: 'Forbidden' });

    }

    next();

};
 
module.exports = { authenticate, authorize };
 
// dummy-payment-gateway.js

module.exports = {

    processPayment: (paymentInfo) => {

        // Simulate payment success or failure

        return paymentInfo.amount > 0;

    }

};
 
// server.js

const express = require('express');

const bodyParser = require('body-parser');

const restaurantRouter = require('./restaurant-service');

const customerRouter = require('./customer-service');

const orderRouter = require('./order-service');
 
const app = express();

app.use(bodyParser.json());
 
// Routes

app.use('/restaurant-service', restaurantRouter);

app.use('/customer-service', customerRouter);

app.use('/order-service', orderRouter);
 
const PORT = 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));