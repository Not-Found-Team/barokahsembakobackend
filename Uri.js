class Uri {
    static get rootUri() { return process.env["ROOT_URI"] || "" };
    static get dbUsername() { return process.env["DB_USERNAME"] };
    static get dbPassword() { return process.env["DB_PASSWORD"] };
    static get dbName() { return process.env["DB_NAME"] };
    static get dbDialect() { return process.env["DB_DIALECT"] };
    static get appPort() { return process.env["APP_PORT"] };
}

module.exports = { Uri }