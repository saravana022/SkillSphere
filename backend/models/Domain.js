const mongoose = require('mongoose');

const domainSchema = new mongoose.Schema({
    name: { type: String, required: true },
    roadmap: { type: String },
    keywords: { type: String }
});

module.exports = mongoose.model('Domain', domainSchema);
