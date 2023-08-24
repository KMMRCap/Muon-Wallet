/**
 * @class The Muon Class
 */
export declare class Muon {
	/**
	 * Creates baseUrl for the request
	 * @param {string} link The baseUrl for the request
	 */
	constructor(link: any)
	/**
	 * Handles requests for opening muon wallet modal
	 * @param {string} appName The name of the app
	 * @param {string} methodName The method name of the app
	 * @param {object} parameters The parameters of the method of the app
	 * @returns {Promise<any>} The result of the request
	 */
	request: (appName: string, methodName: string, parameters: object) => Promise<any>
}
