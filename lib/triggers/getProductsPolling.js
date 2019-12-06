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
const request = require('request-promise').defaults({ simple: false, resolveWithFullResponse: true });



/**
 * This method will be called from OIH platform providing following data
 *
 * @param msg - incoming message object that contains ``body`` with payload
 * @param cfg - configuration that is account information and configuration field values
 * @param snapshot - saves the current state of integration step for the future reference
 */
async function processTrigger(msg, cfg, snapshot = {}) {
	const self = this;
	const token = await getToken(cfg);
	//const iamToken = (msg.body.meta !== undefined && msg.body.meta.iamToken !== undefined) ? msg.body.meta.iamToken : undefined;
	//const iamToken = 'not set yet';

	// Set the snapshot if it is not provided
	snapshot.lastUpdated = snapshot.lastUpdated || (new Date(0)).getTime();

	async function emitData() {
		/*		let applicationUid;
				const getApplicationUidOptions = {
					uri: `http://component-repository.openintegrationhub.com/components/${process.env.ELASTICIO_COMP_ID}`,
					json: true,
					headers: {
						Authorization: `Bearer ${iamToken}`,
					},
				};*/

		/*		if (iamToken) {
					const applicationUidResponse = await request.get(getApplicationUidOptions);
					applicationUid = applicationUidResponse.data.applicationUid; // eslint-disable-line
				}*/

		/** Create an OIH meta object which is required
		* to make the Hub and Spoke architecture work properly
		*/
		/*		const oihMeta = {
					applicationUid: (applicationUid !== undefined && applicationUid !== null) ? applicationUid : 'applicationUid not set yet',
					iamToken: (iamToken !== undefined && iamToken !== null) ? iamToken : undefined,
				};*/

		try {
			//Request Data from SilvERP
			const entries = await getEntries(token, 'Products');
			entries = Object.keys(entries);
			if (Object.entries(entries).length === 0 && entries.constructor === Object) {
				console.error('No Data received');
				return false;
			}

			//Go through received Data and emit each object
			entries.forEach((elem) => {
				const newElement = {};
				/*oihMeta.recordUid = elem.idRecord;
				delete elem.idRecord;*/
				newElement.meta = elem.idRecord;
				delete elem.idRecord;
				newElement.data = elem;
				self.emit('data', messages.newMessageWithBody(newElement));
			});

			self.emit('snapshot', snapshot);
		} catch (e) {
			throw new Error(e);
		}
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