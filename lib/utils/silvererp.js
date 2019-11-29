/**
 * Copyright 2018 yQ-it GmbH
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

"use strict";
const request = require('request-promise');
const BASE_URI = 'http://yq.dyndns.org/SilvERP-OIH/index.php?rest&oih&rt=RestOih&command=';

//Helper to get Token from SilvERP
async function getToken(config) {
	const options = {
		uri: `http://yq.dyndns.org/SilvERP-OIH/index.php?rest&oih&rt=RestOih&command=connect`,
		apikey: config.apikey
	};

	try {
		const tokenRequest = await request.post(options);
		const { token } = tokenRequest;
		return token;
	} catch (err) {
		return err;
	}
}


/**
 * @desc Upsert function which creates or updates
 * an object, depending on certain conditions
 *
 * @access  Private
 * @param {Object} msg - the whole incoming object
 * @param {String} token - token from Snazzy Contacts
 * @param {Boolean} objectExists - ig the object was found
 * @param {String} type - object type - 'person' or 'organization'
 * @param {Object} meta -  meta object containg meta inforamtion
 * @return {Object} - the new created ot update object in Snazzy Contacts
 */
async function upsertObject(data, token, objectExists, type, meta) {
	if (!type) {
		return false;
	}

	let uri;
	let method;

	//if (objectExists) {
	// Update the object if it already exists
	//method = 'PUT';
	//uri = `${BASE_URI}updateProduct`;
	//newObject = prepareObject(msg, type);
	//} else {
	// Create the object if it does not exist
	method = 'POST';
	uri = `${BASE_URI}upsertProduct`;

	let newObject = data;
	delete newObject.uid;
	//}

	try {
		const options = {
			method,
			uri,
			json: true,
			test: 'Iam TEST',
			headers: {
				Authorization: `Bearer ${token}`,
			},
			data: newObject
		};

		const product = await request(options);
		return product;
	} catch (e) {
		return e;
	}
}

module.exports = {
	getToken,
	upsertObject
};