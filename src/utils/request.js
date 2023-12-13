/**
 * request.js handles all requests
 * @author Adam Baťala
 */
import CONST from "./constants";
import { encode } from "base-64";

const root = "/easyapply"
const STATUS_NO_CONTENT = 204;

/**
 * Creates post request
 * @param {String} path 
 * @param {Object} data 
 * @returns Promise
 */
const postRequest = (path, data) => {
    return _createRequest(path, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
};

/**
 * Creates get request
 * @param {String} path 
 * @param {Object} data 
 * @returns Promise
 */
const getRequest = (path, data) => {
    return _createRequest(path, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
};

/**
 * Creates delete request
 * @param {String} path 
 * @returns Promise
 */
const deleteRequest = (path) => {
    return _createRequest(path, {
        method: "DELETE"
    });
};

/**
 * Creates put request
 * @param {String} path 
 * @param {Object} data 
 * @returns Promise
 */
const putRequest = (path, data) => {
    return _createRequest(path, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
};

/**
 * Creates promise to communicate with backend
 * @param {String} path 
 * @param {Object} config 
 * @returns Promise
 */
const _createRequest = (path, config) => {
    config.headers = Object.assign({
        'Authorization': 'Basic ' + encode(CONST.User + ":" + CONST.Pass)
    }, config.headers);

    return fetch(CONST.Host + root + path, config).then(response => {
        if (!response.ok) {
            return response;
        }

        if (response.status !== STATUS_NO_CONTENT) {
            return response.json();
        }
    }).catch(err => {
        console.log(err);
    });
};

export default {
    postRequest,
    getRequest,
    putRequest,
    deleteRequest
}