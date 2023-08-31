const {
  default: CustomErrorHandler,
} = require("../services/CustomErrorHandler");
const { HTTP_STATUS } = require("./constants");

const successResponse = (
  expressResponseObject,
  expressNextObject,
  data,
  httpStatusCode,
  successMessage = ""
) => {
  if (!data && !httpStatusCode) {
    return expressNextObject(
      CustomErrorHandler.notFound(
        `Success response has either no data=${data} or httpStatusCode=${httpStatusCode}`,
        httpStatusCode
      )
    );
  }
  return expressResponseObject.status(httpStatusCode).send({
    data: data,
    statusCode: httpStatusCode ? httpStatusCode : HTTP_STATUS.OK,
    message: successMessage,
    success: true,
  });
};

const errorResponse = (
  expressResponseObject,
  httpStatusCode,
  errorMessage,
  data = null
) => {
  return expressResponseObject.status(httpStatusCode).send({
    statusCode: httpStatusCode
      ? httpStatusCode
      : HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: errorMessage
      ? errorMessage
      : "Internal server error. Please try again later.",
    data: data,
    success: false,
  });
};

const constructResponse = (expressResponseObject, responseData) => {
  if (responseData.success) {
    return expressResponseObject.status(responseData.status).send({
      data: responseData.data,
      message: responseData.message,
      success: true,
    });
  } else {
    if (responseData.data) {
      return expressResponseObject.status(responseData.status).send({
        data: responseData.data,
        message: responseData.message,
        success: false,
      });
    }
    return expressResponseObject.status(responseData.status).send({
      message: responseData.message,
      success: false,
    });
  }
};

module.exports = {
  successResponse,
  errorResponse,
  constructResponse,
};
