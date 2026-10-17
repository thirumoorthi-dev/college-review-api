const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const routes = require('./routes');
const globalErrorHandler = require('./middlewares/errorMiddleware');
const AppError = require('./utils/appError');
const { apiLimiter } = require('./middlewares/rateLimiter');

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || !process.env.CORS_ORIGIN || process.env.CORS_ORIGIN === '*') {
        return callback(null, true);
      }
      return callback(null, process.env.CORS_ORIGIN);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use('/api', apiLimiter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/v1', routes);

app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find endpoint ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
