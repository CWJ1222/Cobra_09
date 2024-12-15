const express = require('express');
const controller = require('../controller/Cmain');
const router = express.Router();

router.get('/', controller.main);
router.get('/visitors', controller.getVisitors);
router.get('/visitor/:id', controller.getVisitor);

router.post('/visitor', controller.postVisitor);
router.delete('/visitor', controller.deleteVisitor);
router.patch('/visitor', controller.patchVisitor);
module.exports = router;
