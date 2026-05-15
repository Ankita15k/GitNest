import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Server is up and running',
        timestamp: new Date().toISOString(),
    });
});

export default router;