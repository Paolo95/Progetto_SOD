const express = require('express');
const router = express.Router();
const getDBDataController = require('../controllers/getDBDataController');

router.post('/', getDBDataController.handleGetDBData);

module.exports = router;