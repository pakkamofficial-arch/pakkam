import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';

export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId }).sort({ createdAt: -1 });

    const total = reviews.length;
    const avgRating = total > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1) : 0;
    const ratingDist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) {
        (ratingDist as any)[r.rating]++;
      }
    });

    res.json({
      success: true,
      total,
      avgRating: Number(avgRating),
      ratingDist,
      reviews,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, rating, title, comment, images } = req.body;
    if (!productId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'productId, rating, comment are required' });
    }

    const review = await Review.create({
      product: productId,
      user: req.user?._id,
      userName: req.user?.name || 'Customer',
      rating,
      title,
      comment,
      images,
      isVerifiedPurchase: true,
    });

    // Recalculate Product average rating
    const reviews = await Review.find({ product: productId });
    const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(productId, { rating: Number(avg.toFixed(1)) });

    res.status(201).json({ success: true, review });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
