const express = require('express');
const authRoutes = require('./authRoutes');
const collegeRoutes = require('./collegeRoutes');
const reviewRoutes = require('./reviewRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/colleges', collegeRoutes);
router.use('/reviews', reviewRoutes);

module.exports = router;
