const Sensor_data = require('../model/Sensor_data');

const handleGetDBData = async (req, res) => {
    
    try {

        //create and store the new user
        const result = await Sensor_data.find({});
        
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ 'Error on get values from DB. Message ': err.message });
    }
}

module.exports = { handleGetDBData };