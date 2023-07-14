const express = require('express');
const router = express.Router();
const getMQTTDataController = require('../controllers/getMQTTDataController');

router.post('/', getMQTTDataController.handlegetMQTTData);

module.exports = router;