class SuccessResponse {
  constructor(message) {
    this.status = 200;
    this.message = message || 'Ok';
    this.expose = true;
  }
}

module.exports.SuccessResponse = SuccessResponse;
