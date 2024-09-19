const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const setupSwagger = require('./swagger');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

connectDB();

app.use(express.json());
setupSwagger(app);
app.use('/api/users', userRoutes);

if (require.main === module) {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app; 