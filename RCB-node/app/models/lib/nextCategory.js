const mongoose = require('mongoose');

const nextCategorySchema = mongoose.Schema({
    starttime: {
        type: String,
    },
});
// categorySchema.set( 'toJSON', { getters: true } )
module.exports = mongoose.model('nextCategory', nextCategorySchema);