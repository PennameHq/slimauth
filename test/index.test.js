const { assert } = require('chai')
const packageIndex = require('../index')
const SlimAuth = require('../lib/SlimAuth')
const helper = require('./helper')()
const { withStubs, expect } = helper

describe('index', () => {
	it('should be an instance of SlimAuth', () => {
		assert.instanceOf(packageIndex, SlimAuth)
	})
})
