import { IOrder } from '../models/Order.js';

/**
 * Normalizes Indian phone numbers to international format (91XXXXXXXXXX)
 */
export const normalizeIndianPhone = (phone: string): string => {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return cleaned;
  }
  if (cleaned.length > 10) {
    return cleaned.slice(-10);
  }
  return cleaned;
};

/**
 * Generates dynamic multiline item string for WhatsApp confirmation message
 */
export const buildWhatsAppItemList = (items: any[]): string => {
  return items
    .map((item) => {
      const name = item.name || item.productName || 'Item';
      const qty = item.quantity || 1;
      const unit = item.selectedUnit || item.unit || 'pack';
      const itemPrice = (item.discountPrice || item.price || 0) * qty;
      return `• ${name} - ${qty} ${unit} - ₹${itemPrice}`;
    })
    .join('\n');
};

/**
 * Sends order confirmation WhatsApp message using Meta WhatsApp Cloud API or simulated service
 * Safe & Idempotent: Never throws or cancels order on API failure
 */
export const sendOrderConfirmationWhatsApp = async (order: any): Promise<boolean> => {
  try {
    if (!order) return false;

    // Part 30: Idempotency check
    if (order.whatsappConfirmationSent) {
      console.log(`[WhatsApp Service] Skipping duplicate notification for Order #${order.orderNumber}`);
      return true;
    }

    const customerPhone = order.deliveryAddress?.phone || order.user?.phone || '9876543210';
    const normalizedPhone = normalizeIndianPhone(customerPhone);
    const orderId = order.orderNumber || order._id;
    const itemListStr = buildWhatsAppItemList(order.items || []);
    const grandTotal = order.total || 0;
    const paymentMethod = order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Online Payment Verified';
    const customerName = order.deliveryAddress?.name || order.user?.name || 'Valued Customer';

    const otpCode = typeof order.deliveryOtp === 'object' ? order.deliveryOtp?.code : (order.deliveryOtp || '----');

    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    const formattedMessage = `🎉 Pakkam Order Confirmed!\n\nYour order has been successfully confirmed.\n\nOrder ID: ${orderId}\n\nAmount: ₹${grandTotal}\n\nDelivery OTP: ${otpCode}\n\nPlease share this OTP with the delivery partner only when your order is being delivered.\n\nThank you for shopping with Pakkam ❤️`;

    console.log(`[WhatsApp Service] Preparing Order Confirmed notification for +${normalizedPhone}:\n${formattedMessage}`);

    if (token && phoneId) {
      // Call Meta WhatsApp Business Cloud API with template pakkam_order_confirmed
      const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: normalizedPhone,
          type: 'template',
          template: {
            name: 'pakkam_order_confirmed',
            language: { code: 'en' },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: customerName },
                  { type: 'text', text: String(orderId) },
                  { type: 'text', text: String(grandTotal) },
                  { type: 'text', text: String(otpCode) },
                ],
              },
            ],
          },
        }),
      });

      const data: any = await response.json();

      if (data && data.messages?.[0]?.id) {
        order.whatsappStatus = 'SENT';
        order.whatsappConfirmationSent = true;
        order.whatsappMessageId = data.messages[0].id;
        order.whatsappSentAt = new Date();
        await order.save();
        console.log(`[WhatsApp Service] Sent successfully! Message ID: ${data.messages[0].id}`);
        return true;
      }
    } else {
      // Credentials not configured — Log fallback for dev mode
      console.log(`[WhatsApp Service Dev Fallback] Simulated WhatsApp message sent to +${normalizedPhone}`);
      order.whatsappStatus = 'SENT';
      order.whatsappConfirmationSent = true;
      order.whatsappSentAt = new Date();
      order.whatsappMessageId = 'sim_' + Date.now();
      await order.save();
      return true;
    }

    return true;
  } catch (err: any) {
    // Part 19: Failure must NOT throw or cancel order!
    console.error(`[WhatsApp Service Error] Failed to send message for Order #${order.orderNumber}:`, err.message);
    try {
      order.whatsappStatus = 'FAILED';
      order.whatsappError = err.message || 'WhatsApp API request failed';
      await order.save();
    } catch (dbErr) {
      // Ignore DB save error
    }
    return false;
  }
};
