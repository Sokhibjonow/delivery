import { Router } from 'express';

/**
 * Express 4 async funksiyalardagi xatolarni o'zi ushlamaydi: xato yuz bersa
 * so'rov javobsiz osilib qoladi va mijoz cheksiz kutadi.
 *
 * Bu yordamchi har bir yo'l ishlovchisini o'rab qo'yadi — xato bo'lsa u
 * Express'ning xatolar ishlovchisiga uzatiladi va mijoz darhol javob oladi.
 */
const METHODS = ['get', 'post', 'put', 'patch', 'delete', 'all', 'use'];

function wrap(handler) {
  if (typeof handler !== 'function') return handler;

  // 4 argumentli funksiya — bu xatolar ishlovchisi, tegmaymiz
  if (handler.length === 4) return handler;

  return function wrapped(req, res, next) {
    try {
      const result = handler(req, res, next);

      if (result && typeof result.catch === 'function') {
        result.catch(next);
      }

      return result;
    } catch (err) {
      next(err);
    }
  };
}

export function asyncRouter() {
  const router = Router();

  for (const method of METHODS) {
    const original = router[method].bind(router);

    router[method] = (...args) => original(...args.map(wrap));
  }

  return router;
}
