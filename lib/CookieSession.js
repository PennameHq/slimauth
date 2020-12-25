const getRandomToken = require('hat')
const { has, is } = require('ramda')

class CookieSession {
	constructor({ req, session }) {
		this._cookieSession = session

		this._init(req)
	}

	get cookieSession() {
		return this.cookieSession
	}

	setUser({ id, accessToken }) {
		if (!id) {
			throw new Error('User must have id')
		}

		if (!accessToken) {
			throw new Error('User must have accessToken')
		}

		this.cookieSession._saUserId = id
		this.cookieSession._saUserAccessToken = accessToken
		this.cookieSession._saUserSetAt = Date.now()

		return this.getUser()
	}

	getHost() {
		return this.cookieSession._saHost
	}

	getSessionId() {
		return this.cookieSession._saDbSessionId
	}

	getUser() {
		const { _saUserId, _saUserAccessToken, _saUserSetAt } = this.cookieSession
		return { id: _saUserId, accessToken: _saUserAccessToken, setAt: _saUserSetAt }
	}

	getUserAnon() {
		return this._cookieSession._saUserAnon
	}

	getCustomField(key, defaultValue = undefined) {
		return this.cookieSession[key] || defaultValue
	}

	setCustomField(key, value) {
		this.cookieSession[key] = value
	}

	ensureCustomFieldObject(key) {
		if (is(Object, this.cookieSession[key])) {
			return
		}
		this.setCustomField(key, {})
	}

	_init(req) {
		const session = this.cookieSession

		if (has('_saDbSessionId', session)) {
			session._saDbSessionId = undefined
		}

		if (has('_saUser', session)) {
			session._saUser = undefined
		}

		if (!session._saOauth) {
			session._saOauth = {}
		}

		if (!session._saHost) {
			session._saHost = req.headers.host
		}

		if (!session._saUserAnon) {
			session._saUserAnon = {}
			if (!session._saUser) {
				session._saUserAnon.id = `lo_${getRandomToken()}`
			}
		}

		if (!session._saFlags) {
			// Ensure the session has key-value flags map
			session._saFlags = {}
		}
	}
}

module.exports = CookieSession
