const CookieSessionManager = require('./CookieSessionManager')

class SlimAuth {
	createCookieSessionManager(config) {
		return new CookieSessionManager(config)
	}
}
module.exports = SlimAuth
