// Controller per estrarre i dati dal DB dei dati provenienti dal BMP280

const Sensor_data = require('../model/Sensor_data');
const BMP280Model = Sensor_data.BMP280;

const handleGetBMPData = async (req, res) => {
    

    try{

        // Restituisce tutti documenti della collection bmp280
        const result = await BMP280Model.find({}).sort({ timestamp: 1 });
        
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ 'Error on get values from DB. Message ': err.message });
    }
}

module.exports = { handleGetBMPData };