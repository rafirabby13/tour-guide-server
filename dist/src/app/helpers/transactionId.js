export const generateTransactionId = () => {
    const timestamp = Date.now(); // Current time in ms
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0'); // 4-digit random number
    return `TXN-${timestamp}-${randomNum}`;
};
