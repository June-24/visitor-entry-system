const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    adminUsername: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

module.exports = mongoose.model('Admin', AdminSchema);
