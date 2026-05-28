import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

const formatUptime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
};

const getDbStatus = (readyState) => {
    const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
    };
    return states[readyState] || 'unknown';
};

router.get('/', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStatus = getDbStatus(dbState);
    const isHealthy = dbState === 1;

    res.status(isHealthy ? 200 : 503).json({
        status: isHealthy ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        uptime: formatUptime(process.uptime()),
        services: {
            database: {
                status: dbStatus,
                name: 'mongodb',
            },
        },
    });
});

export default router;