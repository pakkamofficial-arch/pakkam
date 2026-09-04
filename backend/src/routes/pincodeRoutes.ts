import { Router, Request, Response } from 'express';
import { validateAndLookupPincode } from '../services/pincodeService.js';

const router = Router();

/**
 * GET /api/pincode/:pincode
 * Endpoint for PIN code validation and location lookup
 */
router.get('/:pincode', async (req: Request, res: Response): Promise<void> => {
  try {
    const { pincode } = req.params;
    const result = await validateAndLookupPincode(pincode);

    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error checking PIN code',
    });
  }
});

export default router;
