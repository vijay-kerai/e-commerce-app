import express from 'express';
import validation from '../../dto/productValidation';
import auth from '../../middleware/auth';
import controller from '../../controllers/cartController';

const router = express.Router();

router.post('/addToCart',auth.isLoggedIn,validation.cartAdd,controller.addCart);
router.get('/myCart',auth.isLoggedIn,controller.myCart);
router.get('/removeFromCart/:id',auth.isLoggedIn,controller.removeFromCart);

export default router;