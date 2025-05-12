const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const authenticate = require('../middlewares/authenticate');

router.use(authenticate);

router.post('/', accountController.create);
router.get('/', accountController.getAll);
router.put('/:id', accountController.update);
router.delete('/:id', accountController.remove);
router.get('/', authenticate, accountController.getAll);

module.exports = router;
