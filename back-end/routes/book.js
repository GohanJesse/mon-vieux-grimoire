const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const bookCtrl = require('../controllers/book');


router.get('/:id', auth, bookCtrl.getOneBook);
router.get("/", auth, bookCtrl.getAllBook);
router.get('/bestrating', auth, bookCtrl.getBestRating);
router.post("/", auth, multer, bookCtrl.createBook);
router.put('/:id', auth, multer, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.modifyBook);

module.exports = router;