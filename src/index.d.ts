/**
 * @param {string} appName The name of the app
 * @param {string} methodName The method name of the app
 * @param {object} parameters The parameters of the method of the app
 * @returns {Promise<any>}
 */
export declare function request(
	appName: string,
	methodName: string,
	parameters: object
): Promise<any>
