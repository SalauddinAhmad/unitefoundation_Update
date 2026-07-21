module.exports = function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const message = err.type === 'entity.too.large'
    ? 'Request body is too large. Remove oversized/base64 images and use Media Library URLs.'
    : err.message || 'Server error';
  if (status >= 500) console.error('[ERR]', req.method, req.path, err);
  const body = { message };
  if (err.errors) body.errors = err.errors;
  if (err.code) body.code = err.code;
  res.status(status).json(body);
};
