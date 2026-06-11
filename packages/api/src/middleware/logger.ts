import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, _res: Response, next: NextFunction) {
  const start = Date.now();
  const { method, url } = req;

  // Log on response finish
  _res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${method} ${url} → ${_res.statusCode} (${duration}ms)`);
  });

  next();
}
