'use strict'
module.exports.httpResponse = (statusCode, data, context) => {
  const result = {
    statusCode: statusCode,
    body: data
  }

  if (statusCode >= 400) {
    result.body = JSON.stringify({message: data})
    return JSON.stringify(result)
  } else {
    return result
  }
}