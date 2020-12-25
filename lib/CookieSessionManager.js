const clientSession = require('client-sessions')
const CookieSession = require('./CookieSession')

class CookieSessionManager {
	constructor({ cookieName, cookieNameSuffix, secret, duration, activeDuration, isDev }) {
		if (!secret) {
			throw new Error('A cookie secret is required.')
		}

		if (!cookieName) {
			cookieName = 'session'
		}

		this._secret = secret
		this._cookieName = cookieName
		this._cookieNameSuffix = cookieNameSuffix
		this._duration = duration
		this._activeDuration = activeDuration
		this._isDev = isDev
	}

	/**
	 * Get the HTTP request middleware for use with ExpressJs.
	 */
	getMiddleware() {
		return clientSession(this._getConfig())
	}

	/**
	 * Get the current client session
	 * @param {HttpRequest} req
	 */
	getSession(req) {
		// The only time this should be undefined is if an error occurs
		// before it can be set during the first request
		const session = req[this._getCookieName()]
		if (!session) {
			return
		}

		return new CookieSession({ req, session })
	}

	/**
	 * Reset the current client session
	 * @param {HttpRequest} req
	 */
	resetSession(req) {
		this.getSession(req).reset()
	}

	/**
	 * Returns the database session record's id
	 * @param {HttpRequest} req
	 */
	getSessionId(req) {
		return this.getSession(req).getSessionId()
	}

	/**
	 *
	 * @param {HttpRequest} req
	 */
	getHost(req) {
		let session = this.getSession(req)
		if (session) {
			return session.getHost()
		}
	}

	/**
	 *
	 * @param {HttpRequest} req
	 */
	getUserId(req) {
		let session = this.getSession(req)
		if (session) {
			const user = session.getUser()
			return user.id
		}
	}

	/**
	 *
	 * activeDuration allows users to lengthen their session by interacting with the site.
	 * For instance, if the session is 28 minutes old and the user sends another request,
	 * activeDuration will extend the session’s life for however long you define.
	 * In short, activeDuration prevents the app from logging a user out while they’re still using the site.
	 *
	 * NOTE: For subdomains, read up on https://stackoverflow.com/questions/9071969/using-express-and-node-how-to-maintain-a-session-across-subdomains-hostheaders
	 *
	 * @param {any} app
	 */
	_getConfig() {
		const config = {
			cookieName: this._getCookieName(),
			secret,
			// 60 days cookie expiration
			duration: duration || 60 * 24 * 60 * 60 * 1000,
			// Cookie expiration timer resets if active within 30 days
			activeDuration: activeDuration || 30 * 24 * 60 * 60 * 1000,
			// when true, cookie expires when the browser closes
			ephemeral: false,
			// when true, cookie is not accessible from javascript
			httpOnly: true,
			// when true, cookie will only be sent over SSL.
			// use key 'secureProxy' instead if you handle SSL not in your node process
			secure: false,
		}

		if (!isDev) {
			// For subdomain access.
			// Only use on prod because it breaks our local routing
			// Read more: https://github.com/mozilla/node-client-sessions/issues/93
			config.cookie = {
				domain: host,
			}
		}

		return config
	}

	_getCookieName() {
		return `${this._cookieName}${this._cookieNameSuffix ? `__${this._cookieNameSuffix}` : ''}`
	}
}

module.exports = CookieSessionManager
