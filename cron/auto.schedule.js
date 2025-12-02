import mongoose from 'mongoose';
import cron from 'node-cron';
import { Order } from '../models/order.model.js';
import { Product } from '../models/product.model.js';
import { } from '../models/admin.model.js';
import { NotifyAdmins } from '../services/admin.service.js';
import { CreateNotification } from '../services/notification.service.js';

cron.schedule('*/1 * * * *', async () => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const tenMinutesAgo = new Date(Date.now() - 2000 * 60 * 1000);

    // Finding... pending orders older than 2000 min
    const pendingOrders = await Order.find({
      paymentStatus: 'pending',
      createdAt: { '$lt': tenMinutesAgo }
    }).populate('items.productId', 'stock sales')
      .session(session);

    for (const order of pendingOrders) {

      // Revert
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId._id, {
          $inc: { stock: +item.quantity }
        }, { session });
      }

      // Update product status
      await Order.findByIdAndUpdate(order._id, {
        status: 'cancelled',
      }, { session });
    }

    await session.commitTransaction();
    session.endSession();
    console.log('Auto-cancel via cron')

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Cron error: ', error);
  }
})

cron.schedule('0 * * * *', async () => {

  const MIN_STOCK_THRESHOLD = parseInt(process.env.MIN_STOCK_THRESHOLD) || 5;
  const lowProductsData = [];
  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    // Fetch products with low stock
    const products = await Product.find({
      status: 'approved',
      stock: { $lte: MIN_STOCK_THRESHOLD }, //// or use minStockThreshold
      notifiedLowStock: false
    }).populate('vendorId').session(session);

    for (let product of products) {

      if (!product.vendorId) continue;

      // Vendor must be approved
      if (product.vendorId.status !== 'approved') continue;

      lowProductsData.push({
        productId: product._id,
        name: product.name,
        stock: product.stock,
        vendorId: product.vendorId._id
      });
    }

    if (lowProductsData.length > 0) {
      await Product.updateMany({
        _id: { $in: lowProductsData.map(product => product.productId) }
      },
        { notifiedLowStock: true },
        { session })
    }

    await session.commitTransaction();
    session.endSession();

    console.log(`Stock cron executed. Total low stock products: ${lowProductsData.length}`);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Stock Cron Error:", error);
    return; //Stop here
  }

  try {
    await Promise.all(lowProductsData.map(product => {
      return Promise.all([
        // Send notification to admins
        NotifyAdmins({
          title: 'Low stock alert',
          message: `${product.name} has critically low stock (${product.stock})`,
          type: 'stock'
        }),

        // Send Notification to vendor
        CreateNotification({
          receiver: {
            receiverId: product.vendorId,
            role: 'vendor'
          },
          title: 'Low Stock Alert',
          message: `${product.name} stock is critically low (${product.stock} units left).`,
          type: 'stock'
        })
      ])
    }))
  } catch (NotifyError) {
    console.log("Notification failed:", NotifyError.message);
  }
});

cron.schedule("30 2 * * *", async () => {
  try {
    const orders = await Order.find({
      status: "delivered"
    });

    for (let order of orders) {
      const deliveredAt = new Date(order.deliveredAt);
      const now = new Date();

      const diffDays = Math.floor((now - deliveredAt) / (1000 * 60 * 60 * 24));

      if (diffDays >= order.returnWindow && !order.refundRequested) {
        await Refund.create({
          orderId: order._id,
          userId: order.userId,
          status: "auto_due"
        });

        await NotificationService.Send(
          ADMIN_ID,
          "admin",
          "Refund Due",
          `Refund window passed for order ${order.orderNo}`,
          "order"
        );
      }
    }

    console.log("Refund cron executed.");
  } catch (err) {
    console.error("Refund Cron Error:", err);
  }
});