import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay credentials are not configured',
      });
    }

    const { amount, currency = 'INR', receipt } = req.body;
    const amountInPaise = Number(amount);

    if (!Number.isInteger(amountInPaise) || amountInPaise < 100) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be an integer in paise and at least 100',
      });
    }

    const options = {
      amount: amountInPaise,
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    res.status(500).json({
      success: false,
      message: error.error?.description || error.message || 'Failed to create Razorpay order',
    });
  }
};
