/* eslint no-param-reassign: "off" */

/**
 * Copyright 2019 Wice GmbH
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

const Q = require('q');
const { getToken, upsertObject } = require('./../utils/silvererp');
const { messages } = require('elasticio-node');

/**
 * This method will be called from OIH platform providing following data
 *
 * @param {Object} msg - incoming message object that contains ``body`` with payload
 * @param {Object} cfg - configuration that is account information and configuration field values
 */
async function processAction(msg, cfg) {
	const iamToken = await getToken(cfg);
	const self = this;
	console.log('Evaluating msg.body.data="%j"', msg.body.data);
	const oihUid = (msg.body !== undefined && msg.body.oihUid !== undefined) ? msg.body.oihUid : 'oihUid not set yet';
	const recordUid = (msg.body !== undefined && msg.body.data.recordUid !== undefined) ? msg.body.data.recordUid : undefined;
	const applicationUid = (cfg.applicationUid !== undefined || cfg.applicationUid !== null) ? cfg.applicationUid : 'applicationUid not set yet';
	
	async function emitData() {
		/** Create an OIH meta object which is required
		* to make the Hub and Spoke architecture work properly
		*/
		//console.log('Log adapter'.msg.body);
		const newElement = {};
		const oihMeta = {
			applicationUid,
			oihUid,
			recordUid,
			iamToken: (iamToken !== undefined && iamToken !== null) ? iamToken : undefined,
		};

		let objectExists = false;
		let personObject = msg.body.data;
		// Upsert the object depending on 'objectExists' property
		const reply = await upsertObject(personObject, iamToken, objectExists, 'product');
		newElement.meta = oihMeta;
		newElement.data = reply.data;
		self.emit('data', messages.newMessageWithBody(newElement));
	}

	/**
	 * This method will be called from OIH platform if an error occured
	 *
	 * @param e - object containg the error
	 */
	function emitError(e) {
		console.log('Oops! Error occurred');
		self.emit('error', e);
	}

	/**
	 * This method will be called from OIH platform
	 * when the execution is finished successfully
	 *
	 */
	function emitEnd() {
		console.log('Finished execution');
		self.emit('end');
	}

	Q()
		.then(emitData)
		.fail(emitError)
		.done(emitEnd);
}

module.exports = {
	process: processAction,
};
