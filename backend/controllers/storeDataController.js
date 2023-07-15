const Sensor_data = require('../model/Sensor_data');

const handleStoreDBData = async (req, res) => {

    try {

        //create and store the new user
        const result = await Sensor_data.create({

            timestamp: req.body.timestamp,
            temperature: req.body.temperature,
            altitude: req.body.altitude,
            pressure: req.body.pressure,
            lux: req.body.lux

        });

        res.status(200).json({ result });
    } catch (err) {
        res.status(500).json({ 'Error on insert new record in MongoDB. Message ': err.message });
    }
}

module.exports = { handleStoreDBData };