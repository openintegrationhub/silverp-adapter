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
const uri = 'http://yq.dyndns.org/SilvERP-OIH/index.php?rest&oih&rt=RestOih&command=connect';

//Helper to get Token from SilvERP
async function getToken(config) {
	const options = {
		uri,
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

module.exports = {
	getToken
};