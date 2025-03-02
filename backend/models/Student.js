const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    rollNo: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

module.exports = mongoose.model('Student', StudentSchema);
