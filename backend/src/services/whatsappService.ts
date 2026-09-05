import twilio from 'twilio';

/**
 * Normalizes Indian phone numbers for Twilio WhatsApp (whatsapp:+91XXXXXXXXXX)
 */
export const formatWhatsAppNumber = (phone: string): string => {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `whatsapp:+91${cleaned}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `whatsapp:+${cleaned}`;
  }
  if (cleaned.startsWith('+')) {
    return `whatsapp:${cleaned}`;
  }
  return `whatsapp:+91${cleaned.slice(-10)}`;
};

/**
 * Generates a concise product summary string (e.g. "Tomato x2, Onion x1")
 */
export const buildProductSummary = (items: any[]): string => {
  if (!items || items.length === 0) return 'Groceries';
  return items
    .map((item) => {
      const name = item.name || item.productName || item.product?.name || 'Item';
      const qty = item.quantity || 1;
      return `${name} x${qty}`;
    })
    .join(', ');
};

/**
 * Sends Order Confirmation WhatsApp message via Twilio Sandbox/API.
 * Safe & Idempotent: Never throws or interrupts order creation.
 */
export const sendOrderConfirmationWhatsApp = async (order: any): Promise<boolean> => {
  try {
    if (!order) return false;

    // Avoid sending duplicate WhatsApp notifications for the same order
    if (order.whatsappConfirmationSent) {
      console.log(`[WhatsApp Service] Skipping duplicate notification for Order #${order.orderNumber}`);
      return true;
    }

    const toPhone = order.deliveryAddress?.phone || order.user?.phone || '9876543210';
    const fullName = order.deliveryAddress?.name || order.user?.name || 'Customer';
    const productSummary = buildProductSummary(order.items || []);
    const amount = order.total || 0;
    const paymentMethodStr = order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment';
    const otp = typeof order.deliveryOtp === 'object' ? order.deliveryOtp?.code : (order.deliveryOtp || '----');

    const formattedRecipient = formatWhatsAppNumber(toPhone);

    const messageBody =
      `Hello ${fullName}, your order for ${productSummary} is confirmed successfully.\n` +
      `Amount: ₹${amount} (${paymentMethodStr})\n` +
      `Your delivery OTP is: ${otp}`;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromWhatsApp = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

    console.log(`[WhatsApp Service] Preparing WhatsApp message to ${formattedRecipient}:\n${messageBody}`);

    // If Twilio credentials are ready and not placeholders
    if (accountSid && authToken && !accountSid.includes('your_twilio') && !authToken.includes('your_twilio')) {
      const client = twilio(accountSid, authToken);
      
      /* 
       * Note for Production: Twilio Sandbox requires recipient numbers to send a 1-time join code 
       * (e.g., "join <code") to TWILIO_WHATSAPP_FROM before receiving sandbox messages. 
       * When upgrading to a production WhatsApp Business profile, pre-approved Meta templates 
       * replace the sandbox requirement.
       */
      const result = await client.messages.create({
        from: fromWhatsApp,
        to: formattedRecipient,
        body: messageBody,
      });

      order.whatsappStatus = 'SENT';
      order.whatsappConfirmationSent = true;
      order.whatsappMessageId = result.sid;
      order.whatsappSentAt = new Date();
      await order.save();
      console.log(`[WhatsApp Service] Sent via Twilio successfully! SID: ${result.sid}`);
      return true;
    } else {
      // Dev / Test Mode Fallback Log
      console.log(`[WhatsApp Service Dev Mode] Credentials not set. Simulated send to ${formattedRecipient}`);
      order.whatsappStatus = 'SENT';
      order.whatsappConfirmationSent = true;
      order.whatsappSentAt = new Date();
      order.whatsappMessageId = 'sim_' + Date.now();
      await order.save();
      return true;
    }
  } catch (err: any) {
    // Non-negotiable Rule: WhatsApp send failure must NEVER block or roll back order creation
    console.error(`[WhatsApp Service Error] Failed to send WhatsApp message for Order #${order?.orderNumber}:`, err.message);
    try {
      if (order && typeof order.save === 'function') {
        order.whatsappStatus = 'FAILED';
        order.whatsappError = err.message || 'WhatsApp API request failed';
        await order.save();
      }
    } catch (saveErr) {
      // Silent catch
    }
    return false;
  }
};
