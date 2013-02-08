var util = require('util'),
    Status,
    json_response,
    api;

Status = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INVALID: 422,
  SERVER_ERROR: 500
};

json_response = function (error, status, data, res) {
  var out = {status: status};
  if (!res) {
    res = data;
    data = {};
  }
  if (error) {
    out.error = error;
  }
  else {
    out.data = data;
  }
  res.status(status);
  res.json(out);
};

api = {
  ok: function (req, res, data) {
    data || (data = {});
    json_response(null, Status.OK, data, res);
  },

  unauthorized: function (req, res) {
    var error = {message: "Unauthorized"};
    json_response(error, Status.UNAUTHORIZED, res);
  },

  notFound: function (req, res, detail) {
    var error = {message: "Not found"};
    if (detail && detail !== '') {
      error.detail = detail;
    }
    json_response(error, Status.NOT_FOUND, res);
  },

  missingParam: function (req, res, params) {
    var error = {message: "Missing required parameter(s)"};
    if (util.isArray(params)) {
      error.params = params;
    }
    json_response(error, Status.BAD_REQUEST, res);
  },

  invalid: function (req, res, detail) {
    var error = {message: "Invalid request"};
    if (detail && detail !== '') {
      error.detail = detail;
    }
    json_response(error, Status.INVALID, res);
  },

  serverError: function (req, res, detail) {
    var error = {message: "Server error"};
    if (detail && detail !== '') {
      error.detail = detail;
    }
    json_response(error, Status.SERVER_ERROR, res);
  },

  requireParams: function (req, res, params, success) {
    var missing = []
    params.forEach(function (param) {
      if (!req.body[param]) {
        missing.push(param);
      }
    });
    if (missing.length > 0) {
      api.missingParam(req, res, missing);
    }
    else {
      success();
    }
  }
};

module.exports = api;