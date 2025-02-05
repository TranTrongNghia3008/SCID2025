'use strict';

const express = require('express');
const controller = require('../controllers/q-and-aController');
const router = express.Router();

router.get('/', controller.show);

router.get('/conversations/:id', controller.getHistory);

router.post('/conversations/new', controller.createNewChat);

router.delete('/conversations/:id', controller.deleteConversation);

router.put('/conversations/:id/updateHistory', controller.updateHistory);
router.put('/conversations/:id/updateLocations', controller.updateLocations);
router.put('/conversations/:id/renameConversation', controller.renameConversation);
router.get('/conversations/:id/locations', controller.loadLocations);

module.exports = router;