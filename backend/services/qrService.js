const QRCode = require('qrcode');
const config = require('../config/config');

async function generateBatchQRCode(batchId) {
  const verificationUrl = `${config.FRONTEND_URL}/verify/${batchId}`;
  try {
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      color: {
        dark: '#1E293B',
        light: '#FFFBEB'
      },
      width: 320
    });
    return {
      verificationUrl,
      qrDataUrl
    };
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

module.exports = {
  generateBatchQRCode
};
