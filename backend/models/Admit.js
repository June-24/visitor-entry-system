const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema({
    entryTime: { type: Date, required: true },
    exitTime: { type: Date, default: null },  // Null means visitor hasn't exited yet
    purpose: {type: String},
    quantity: {type:Number, required:true},
    status: { type: String, enum: ["in-progress", "completed"], default: "in-progress" }
});

const visitorSchema = new mongoose.Schema({
    govID: { type: String, required: true, unique: true },  // Unique ID (e.g., Aadhaar, Passport)
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    userRole: { type: String, required: true },
    type: { type: String, required: true },
    userId: { type: String, required: true }, 
    visits: [visitSchema]
}, { timestamps: true });

const Visitor = mongoose.model("Visitor", visitorSchema);
module.exports = Visitor;
