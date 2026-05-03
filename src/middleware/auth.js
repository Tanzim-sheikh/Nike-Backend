import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config(); // Force load env

const JWT_SECRET = process.env.JWT_SECRET?.trim() || 'your_super_secret_jwt_key_change_this_in_production';

console.log('🔐 Auth middleware secret (first 6 chars):', JWT_SECRET.substring(0, 6));

export const authenticate = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('🔑 Received token (first 20 chars):', token?.substring(0, 20));
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Decoded token:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};