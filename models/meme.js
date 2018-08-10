var mongoose = require('mongoose');
 
var memeSchema = new mongoose.Schema({
    name: { type: String }
});
 
module.exports = mongoose.model('Meme', memeSchema);