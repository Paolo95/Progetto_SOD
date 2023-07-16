const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const schemaOptions = {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  };

const Sensor_data_schema = new Schema({
    timestamp: {
        type: String,
        required: true
    },
    temperature: {
        type: String,
        required: true
    },
    pressure: {
        type: String,
        required: true
    },
    lux: {
        type: String,
        required: true
    },
    altitude: {
        type: String,
        required: true
    },
    refreshToken: String
}, schemaOptions);

module.exports = mongoose.model('Sensor_data', Sensor_data_schema);