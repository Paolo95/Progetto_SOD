const express = require('express');
const router = express.Router();
const storeDataController = require('../controllers/storeDataController');

router.post('/', storeDataController.handleStoreDBData);

module.exports = router;