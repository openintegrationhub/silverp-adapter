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
const { getToken, getEntries } = require('./../utils/silvererp');
const { messages } = require('elasticio-node');

/**
 * This method will be called from OIH platform providing following data
 *
 * @param msg - incoming message object that contains ``body`` with payload
 * @param cfg - configuration that is account information and configuration field values
 * @param snapshot - saves the current state of integration step for the future reference
 */
async function processTrigger(msg, cfg, snapshot = {}) {
	const self = this;
	const iamToken = await getToken(cfg);

	// Set the snapshot if it is not provided
	snapshot.lastUpdated = snapshot.lastUpdated || (new Date(0)).getTime();

	async function emitData() {
		/** Create an OIH meta object which is required
		* to make the Hub and Spoke architecture work properly
		*/
		const oihMeta = {
			applicationUid: (cfg.applicationUid !== undefined && cfg.applicationUid !== null) ? cfg.applicationUid : undefined,
			iamToken: (iamToken !== undefined && iamToken !== null) ? iamToken : undefined,
		};

		//Request Data from SilvERP
		const entries = await getEntries(iamToken, 'country');
		if (!entries || !Array.isArray(entries)) {
			return 'Expected records array.';
		}

		//Go through received Data and emit each object
		entries.forEach((elem) => {
			const newElement = {};
			/*oihMeta.recordUid = elem.idRecord;
			delete elem.idRecord;*/
			oihMeta.recordUid = elem.idRecord;
			newElement.meta = oihMeta;
			delete elem.idRecord;
			newElement.data = elem;
			self.emit('data', messages.newMessageWithBody(newElement));
		});
		self.emit('snapshot', snapshot);
	}
	/**
	 * This method will be called from OIH platform if an error occured
	 *
	 * @param e - object containg the error
	 */
	function emitError(e) {
		console.log(`ERROR: ${e}`);
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
	process: processTrigger,
};