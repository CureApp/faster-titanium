
/**
 * value object containing statusCode, contentType, content
 */
export default class ResponseInfo {
    constructor(content = '', contentType = 'text/plain', statusCode = 200) {
        this.content     = content
        this.contentType = contentType
        this.statusCode  = statusCode
    }
}
