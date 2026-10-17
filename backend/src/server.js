require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  process.stderr.write('FATAL: JWT_SECRET environment variable is missing in production mode.\n');
  process.exit(1);
}

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    process.stdout.write(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode\n`);
  });

  const handleTermination = (signal) => {
    process.stdout.write(`${signal} received. Closing HTTP server gracefully...\n`);
    server.close(() => {
      process.stdout.write('HTTP server closed.\n');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleTermination('SIGTERM'));
  process.on('SIGINT', () => handleTermination('SIGINT'));

  process.on('unhandledRejection', (err) => {
    process.stderr.write(`Unhandled Rejection: ${err.message}\n`);
    server.close(() => {
      process.exit(1);
    });
  });
}).catch((err) => {
  process.stderr.write(`Failed to connect to database: ${err.message}\n`);
  process.exit(1);
});
