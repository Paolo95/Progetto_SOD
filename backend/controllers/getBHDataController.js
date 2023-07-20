// Controller per estrarre i dati dal DB dei dati provenienti dal BH1750

const Sensor_data = require('../model/Sensor_data');
const BH1750Model = Sensor_data.BH1750;

const handleGetBHData = async (req, res) => {
    

    try{

        // Restituisce tutti documenti della collection bh1750
        const result = await BH1750Model.find({}).sort({ timestamp: 1 });
        
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ 'Error on get values from DB. Message ': err.message });
    }
}

module.exports = { handleGetBHData };