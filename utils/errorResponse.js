class ErrorResponse extends Error {

    constructor(message, statusCode, err) {
        super(message);
        this.statusCode = statusCode;
        this.err = err;
    }

}

module.exports = {
    ErrorResponse
}