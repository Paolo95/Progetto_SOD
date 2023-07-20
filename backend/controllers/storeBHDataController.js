// Controller per gestire la memorizzazione dei nuovo dati del BH1750 su richiesta

const Sensor_data = require('../model/Sensor_data');
const BH1750Model = Sensor_data.BH1750;

const handleStoreBHData = async (req, res) => {
    
    try {

        // Crea un nuovo documento nella collection del bh1750
        const result = await BH1750Model.create({

            timestamp: req.body.timestamp,
            lux: req.body.lux,

        });

        res.status(200).json({ result });
    } catch (err) {
        res.status(500).json({ 'Error on insert new record in MongoDB. Message ': err.message });
    }
}

module.exports = { handleStoreBHData };