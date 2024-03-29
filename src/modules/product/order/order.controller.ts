import db from '../../../database/config.database';
import response from '../../../utils/response';
import  {Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync';

const Order = db.orders;
const Cart = db.carts;
const Product = db.products;
const OrderItem = db.orderItems;

const placeOrder = catchAsync(async (req: Request, res: Response) => {
    let orderId;
    const currentYear = new Date().getFullYear();
    const lastOrder = await Order.findOne({
        order: [ ['createdAt', 'DESC'] ]
        //attributes: ['orderId','createdAt']
    });
    if (!lastOrder){
        orderId = `${currentYear}-OD-1`
    }
    else {
        const splitId = lastOrder.orderId.split('-');
        if(splitId[0] == currentYear){
            let id = splitId[2] + 1;
            orderId = `${currentYear}-OD-${id}`;
        }
        else{
            orderId = `${currentYear}-OD-1`;
        } 
    }
    const product = await Product.findOne({ where: { id: res.locals.order.productId } });
    if (!product) {
        return response.errorResponse(res, 400, 'Product not found with this productId');
    }
    if (product.stock < res.locals.order.quantity) {
        return response.errorResponse(res, 400,'Quantity is greater than available quantity in stock')
    }
    const orderItem = await OrderItem.create({
        orderId,

    });
    const totalPrice = product.price * res.locals.order.quantity;
    const order = await Order.create({  
        orderId,
        userId : res.locals.user.id,
        totalPrice,
        date: Date.now(),
        status: res.locals.order.status
    });
    return response.response(res,201,{order},'Order place successful');
});

const getOrders = catchAsync(async (req: Request, res: Response) => {
    const orders = await Order.findAll({
        where:{userId: res.locals.user.id}
    });
    return response.response(res,200,{orders},"All Orders");
});
export default {
    placeOrder,
    getOrders
}