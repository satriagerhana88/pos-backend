require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const testRoutes = require("./routes/test.route");
const adminStoreRoutes = require("./routes/adminStore.routes");
const branchRoutes = require("./routes/branch.routes");
const categoryRoutes = require("./routes/category.routes");
const productRoutes = require("./routes/product.routes");
const branchProductRoutes = require("./routes/branchProduct.routes");
const stockAlertRoutes = require("./routes/stockAlert.routes");
const branchStockRoutes = require("./routes/branchStock.routes");
const rentalRoutes = require("./routes/rental.routes");
const stockOpnameRoutes = require("./routes/stockOpname.routes");
const notificationRoutes = require("./routes/notification.routes");
const searchRoutes = require("./routes/search.routes");
const path = require("path");

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ✅ Routing
app.use('/api/auth', authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/admin-stores", adminStoreRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/branch-products", branchProductRoutes);
app.use("/api/stock-alerts", stockAlertRoutes);
app.use("/api/branch-stock", branchStockRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/stock-opnames", stockOpnameRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/search", searchRoutes);


app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get('/', (req, res) => res.send('POS Rental Camping API running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
