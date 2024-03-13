// api/server.js

module.exports = async (req, res) => {
  res.status(200).json({ message: 'Hello from Vercel serverless function!' });
};
