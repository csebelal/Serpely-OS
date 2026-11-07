import express, { Router, Request, Response } from 'express';
import { getPrimaryPgPool, getDbConnectionInfo } from '../db/sql-engine';

export interface HealthRouterOptions {
  getActiveWorkspacesCount?: () => number;
  skipDbPing?: boolean;
}

export function createHealthRouter(options: HealthRouterOptions = {}): Router {
  const router = express.Router();

  router.get('/', async (_req: Request, res: Response) => {
    try {
      const uptimeSec = Math.floor(process.uptime());
      const hours = Math.floor(uptimeSec / 3600);
      const minutes = Math.floor((uptimeSec % 3600) / 60);
      const seconds = uptimeSec % 60;
      const uptimeFormatted = `${hours}h ${minutes}m ${seconds}s`;

      const memUsage = process.memoryUsage();
      const toMb = (bytes: number) => (bytes / 1024 / 1024).toFixed(2) + ' MB';

      const dbInfo = getDbConnectionInfo();
      let dbStatus = dbInfo.connected ? 'connected' : 'configured';
      let dbError: string | null = null;
      let dbLatencyMs: number | null = null;

      if (!options.skipDbPing && dbInfo.hasConfiguredUrl) {
        try {
          const pool = getPrimaryPgPool();
          if (pool) {
            const dbStart = Date.now();
            await Promise.race([
              pool.query('SELECT 1'),
              new Promise((_, reject) => setTimeout(() => reject(new Error('DB query timeout (2000ms)')), 2000))
            ]);
            dbLatencyMs = Date.now() - dbStart;
            dbStatus = 'healthy';
          }
        } catch (err: any) {
          dbStatus = 'degraded';
          dbError = err?.message || 'Database ping timed out or failed';
        }
      }

      const payload = {
        status: dbStatus === 'healthy' || dbStatus === 'connected' || options.skipDbPing ? 'healthy' : 'degraded',
        service: 'sincly-marketing-os',
        timestamp: new Date().toISOString(),
        uptime: {
          seconds: uptimeSec,
          formatted: uptimeFormatted
        },
        system: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          pid: process.pid
        },
        memory: {
          rss: toMb(memUsage.rss),
          heapTotal: toMb(memUsage.heapTotal),
          heapUsed: toMb(memUsage.heapUsed),
          external: toMb(memUsage.external)
        },
        database: {
          status: dbStatus,
          engine: dbInfo.engine,
          host: dbInfo.host,
          latencyMs: dbLatencyMs,
          error: dbError
        },
        activeWorkspaces: options.getActiveWorkspacesCount ? options.getActiveWorkspacesCount() : undefined
      };

      const statusCode = payload.status === 'healthy' ? 200 : 503;
      return res.status(statusCode).json(payload);
    } catch (err: any) {
      return res.status(500).json({
        status: 'error',
        service: 'sincly-marketing-os',
        error: err?.message || 'Internal health check failure'
      });
    }
  });

  return router;
}

export default createHealthRouter;
