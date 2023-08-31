class CustomErrorHandler extends Error {
  constructor(status, msg) {
    super();
    this.status = status;
    this.message = msg;
  }

  static alreadyExist(message) {
    return new CustomErrorHandler(409, message);
  }

  static wrongCredentials(message = "Username or password is wrong!") {
    return new CustomErrorHandler(401, message);
  }

  static unAuthorized(message = "unAuthorized") {
    return new CustomErrorHandler(401, message);
  }

  static notFound(message = "404 not found", statusCode = 404) {
    return new CustomErrorHandler(statusCode, message);
  }

  static serverError(message = "Internal server error") {
    return new CustomErrorHandler(500, message);
  }
  static emptyState(message = "req is empty and not found") {
    return new CustomErrorHandler(500, message);
  }
  static validation(message = "missing characters") {
    return new CustomErrorHandler(422, message);
  }
}

export default CustomErrorHandler;
