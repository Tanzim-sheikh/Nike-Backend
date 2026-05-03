import nodemailer from "nodemailer";

function ensureEnv() {
  const user = (process.env.EMAIL || process.env.EMAIL_USER || "").trim();
  const pass = (process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || "").trim();
  if (!user || !pass) {
    const missing = [];
    if (!user) missing.push("EMAIL or EMAIL_USER");
    if (!pass) missing.push("EMAIL_PASSWORD or EMAIL_PASS");
    throw new Error(
      `Missing env: ${missing.join(", ")}. For Gmail, use a 16-character App Password (with 2FA enabled).`
    );
  }
  return { user, pass };
}

function createTransporter() {
  const { user, pass } = ensureEnv();
  if ((process.env.NODE_ENV || 'development') === 'development') {
    console.log("[mailer] EMAIL set:", !!user, "PASSWORD set:", !!pass);
  }
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // SSL
    auth: { user, pass },
  });
}

export const sendVerificationEmail = async (email, token) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `Nike <${process.env.EMAIL}>`,
    to: email,
    replyTo: process.env.EMAIL,
    subject: "Verify Your Email - Nike",
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: #111; line-height: 1.6">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #111; margin: 0;">Nike</h1>
          <p style="color: #666; margin: 5px 0;">Just Do It</p>
        </div>
        
        <h2 style="color: #333; text-align: center;">Verify Your Email Address</h2>
        
        <p style="color: #555; line-height: 1.6; text-align: center;">
          Thank you for registering with Nike. Please click the button below to verify your email address and complete your registration.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" 
             style="background-color: #000; color: white; padding: 14px 28px; 
                    text-decoration: none; border-radius: 30px; display: inline-block;
                    font-weight: bold; font-size: 16px;">
            Verify Email Address
          </a>
        </div>
        
        <p style="color: #777; font-size: 14px; text-align: center;">
          Or copy and paste this link in your browser:<br>
          <a href="${verificationLink}" style="color: #007bff; word-break: break-all;">
            ${verificationLink}
          </a>
        </p>
        
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
          This verification link will expire in 24 hours.<br>
          If you didn't create an account, please ignore this email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0" />
        <p style="font-size: 12px; color: #666; margin: 0">Sent by Nike</p>
      </div>
    `,
    headers: { 'X-Mailer': 'Nike' },
  });
};

// Welcome email after successful verification
export const sendWelcomeEmail = async (email, userName) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"Nike" <${process.env.EMAIL}>`,
    to: email,
    replyTo: process.env.EMAIL,
    subject: "Welcome to Nike - Email Verified Successfully!",
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: #111; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #111; margin: 0; font-size: 32px; font-weight: bold;">NIKE</h1>
          <p style="color: #666; margin: 5px 0; font-style: italic;">Just Do It</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #000 0%, #333 100%); padding: 40px; border-radius: 15px; text-align: center; color: white;">
          <h2 style="margin: 0 0 20px; font-size: 28px; font-weight: bold;">
            Welcome to the Nike Family! 🎉
          </h2>
          <p style="font-size: 18px; margin: 0;">
            Your email has been successfully verified
          </p>
        </div>
        
        <div style="padding: 30px 20px;">
          <p style="margin-bottom: 15px;">Hi <strong>${userName}</strong>,</p>
          
          <p style="margin-bottom: 15px;">
            Congratulations! Your email address has been successfully verified and your Nike account is now active.
          </p>
          
          <p style="margin-bottom: 20px;">
            You can now log in to your account and explore the world of Nike:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/login" 
               style="background-color: #000; color: white; padding: 14px 35px; 
                      text-decoration: none; border-radius: 30px; display: inline-block;
                      font-weight: bold; font-size: 16px; letter-spacing: 1px;">
              LOGIN TO YOUR ACCOUNT
            </a>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 25px 0;">
            <h4 style="margin: 0 0 15px; color: #111;">What's Next?</h4>
            <ul style="margin: 0; padding-left: 20px; color: #555;">
              <li>Browse our latest collections</li>
              <li>Get personalized recommendations</li>
              <li>Access exclusive member-only deals</li>
              <li>Track your orders and wishlist</li>
            </ul>
          </div>
          
          <p style="margin-bottom: 10px; color: #666;">
            If you have any questions, feel free to reply to this email or visit our help center.
          </p>
          
          <p style="margin: 0; color: #666;">
            Welcome aboard!<br>
            <strong>The Nike Team</strong>
          </p>
        </div>
        
        <div style="border-top: 1px solid #eee; padding: 20px 0; margin-top: 30px;">
          <p style="text-align: center; color: #999; font-size: 12px; margin: 0;">
            &copy; ${new Date().getFullYear()} Nike, Inc. All Rights Reserved.<br>
            One Bowerman Drive, Beaverton, OR 97005, USA
          </p>
        </div>
      </div>
    `,
    headers: { 'X-Mailer': 'Nike' },
  });
};

// sendPasswordResetEmail
export const sendPasswordResetEmail = async (email, token) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `Nike <${process.env.EMAIL}>`,
    to: email,
    subject: "Reset Your Password - Nike",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #111;">Reset Your Password</h2>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 30px;">Reset Password</a>
        </div>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr />
        <p style="font-size: 12px; color: #666;">Nike</p>
      </div>
    `
  });
};

export const sendOrderConfirmationEmail = async (email, order) => {
  const transporter = createTransporter();
  const itemsHtml = order.items.map(item => `
    <tr>
      <td><img src="${item.image}" width="50" style="border-radius:8px"/></td>
      <td>${item.name}</td>
      <td>${item.size}</td>
      <td>${item.quantity}</td>
      <td>₹${item.price}</td>
      <td>₹${item.price * item.quantity}</td>
    </tr>
  `).join('');

  const total = order.totalAmount;
  const html = `
    <div style="font-family: Arial; max-width:600px">
      <h2>🎉 Order Confirmed!</h2>
      <p>Dear ${order.address?.houseNo}, your order has been placed successfully.</p>
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Payment ID:</strong> ${order.paymentId}</p>
      <p><strong>Delivery Date:</strong> ${new Date(order.deliveryDate).toLocaleDateString()}</p>
      <table border="1" cellpadding="8" style="width:100%; border-collapse:collapse">
        <thead style="background:#000;color:#fff"><tr><th>Image</th><th>Product</th><th>Size</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot><tr><td colspan="5" style="text-align:right"><strong>Grand Total:</strong></td><td><strong>₹${total}</strong></td></tr></tfoot>
      </table>
      <p>Your order will be delivered to: ${order.address.addressLine}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}</p>
      <p>Thank you for shopping with Nike!</p>
    </div>
  `;
  await transporter.sendMail({
    from: `Nike <${process.env.EMAIL}>`,
    to: email,
    subject: `Order Confirmed - ${order._id}`,
    html,
  });
};

export const sendAdminOrderNotification = async (order, userEmail) => {
  const transporter = createTransporter();
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn('ADMIN_EMAIL not set, skipping admin notification');
    return;
  }

  const itemsHtml = order.items.map(item => `
    <tr>
      <td><img src="${item.image}" width="50" style="border-radius:8px"/></td>
      <td>${item.name}</td>
      <td>${item.size}</td>
      <td>${item.quantity}</td>
      <td>₹${item.price}</td>
      <td>₹${item.price * item.quantity}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial; max-width:600px">
      <h2>🛍️ New Order Received!</h2>
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Customer:</strong> ${userEmail}</p>
      <p><strong>Payment ID:</strong> ${order.paymentId}</p>
      <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleString()}</p>
      <p><strong>Delivery Date:</strong> ${new Date(order.deliveryDate).toLocaleDateString()}</p>
      <h3>Items:</h3>
      <table border="1" cellpadding="8" style="width:100%; border-collapse:collapse">
        <thead style="background:#000;color:#fff">
          <tr><th>Image</th><th>Product</th><th>Size</th><th>Qty</th><th>Price</th><th>Total</th></tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr><td colspan="5" style="text-align:right"><strong>Grand Total:</strong></td><td><strong>₹${order.totalAmount}</strong></td></tr>
        </tfoot>
      </table>
      <p><strong>Shipping Address:</strong><br/>
      ${order.address.houseNo}, ${order.address.addressLine},<br/>
      ${order.address.city}, ${order.address.district}, ${order.address.state} - ${order.address.pincode}<br/>
      Mobile: ${order.address.mobile}
      </p>
      <p>Please process this order at the earliest.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `Nike Store <${process.env.EMAIL}>`,
    to: adminEmail,
    subject: `New Order #${order._id} - Action Required`,
    html,
  });
};