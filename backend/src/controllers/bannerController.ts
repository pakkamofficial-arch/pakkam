import { Request, Response } from 'express';
import { Banner } from '../models/Banner.js';

export const getActiveBanners = async (req: Request, res: Response) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1 });
    res.json({ success: true, banners });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBanner = async (req: Request, res: Response) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json({ success: true, banner });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBanner = async (req: Request, res: Response) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Banner deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
