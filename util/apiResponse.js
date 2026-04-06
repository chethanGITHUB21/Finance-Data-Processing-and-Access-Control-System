function successResponse(res, statusCode, message, data = null) {
  return res.status(statusCode).json({
    sucess: true,
    message,
    data,
  });
}
function errorResponse(res, statusCode, message, err) {
  return res.status(statusCode).json({
    sucess: false,
    message,
    error: err,
  });
}

module.exports = {
  successResponse,
  errorResponse,
};
