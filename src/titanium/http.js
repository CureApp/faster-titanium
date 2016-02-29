
export default class Http {

    static get(url, options = {}) {

        const {timeout} = options
        const timestamp = new Date().getTime()

        const proxy = Ti.Network.createHTTPClient()
        proxy.open('GET', url)

        Object.keys(options.header || {}).forEach(key => {
            proxy.setRequestHeader(key, options.header[key])
        })

        proxy.send()

        let result = null

        while (true) {
            if (proxy.readyState === 4) {
                if (proxy.status == 200) {
                    result = proxy.responseText
                    break
                }
                throw new Error(`[HTTP GET] status:${proxy.status}\n ${proxy.responseText}`)
            }

            if (new Date().getTime() - timestamp > timeout) {
                throw new Error(`[HTTP GET] request timed out: ${url}`)
            }
        }
        return result
    }
}
