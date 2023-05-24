const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const bookCtrl = require('../controllers/book');


router.get('/:id', auth, bookCtrl.getOneBook);
router.get("/", auth, bookCtrl.getAllBook);
router.post("/", auth, multer, bookCtrl.createBook);
router.put('/:id', auth, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.modifyBook);

module.exports = router;