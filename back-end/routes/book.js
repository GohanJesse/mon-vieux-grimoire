const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const compress = require('../middleware/multer-config');

const bookCtrl = require('../controllers/book');


router.get('/bestrating', bookCtrl.getBestRating);
router.get('/:id', bookCtrl.getOneBook);
router.get("/", bookCtrl.getAllBook);

router.post("/", auth, compress, bookCtrl.createBook);
router.post("/:id/rating", auth, bookCtrl.createRating);

router.put('/:id', auth, compress, bookCtrl.modifyBook);

router.delete('/:id', auth, bookCtrl.deleteBook);

module.exports = router;