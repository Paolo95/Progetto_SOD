const Sensor_data = require('../model/Sensor_data');

const handleGetDBData = async (req, res) => {
    
    try {

        //create and store the new user
        const result = await Sensor_data.findAll({
            
        });

        console.log(result);

        res.status(200).json({ 'success': `Query Done!` });
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}

module.exports = { handleGetDBData };