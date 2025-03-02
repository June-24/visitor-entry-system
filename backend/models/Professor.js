const mongoose = require('mongoose');

const ProfessorSchema = new mongoose.Schema({
    profId: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

module.exports = mongoose.model('Professor', ProfessorSchema);
