import QRCode from 'qrcode';

// Generate a QR code from the given data
export const generateQRCode = async (data: object): Promise<string> => {
    try {
      const jsonData = JSON.stringify(data); // Convert object to JSON string
      return await QRCode.toDataURL(jsonData); // Generate QR code as a data URL
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  };

// Decode a QR code to extract the data
export const decodeQrCode = async (dataURL: string): Promise<object> => {
    throw new Error('Not implemented');
}; 