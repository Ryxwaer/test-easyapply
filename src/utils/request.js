/**
 * request.js handles all requests to the backend
 */
import CONST from "./constants";
import { encode } from "base-64";
import axios from "axios";

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
 * Creates promise to communicate with backend
 * @param {String} path 
 * @param {Object} config 
 * @returns Promise
 */
const _createRequest = (path, config) => {
    const defaultHeaders = {
        'Authorization': 'Basic ' + encode(CONST.User + ":" + CONST.Pass)
    };

    const axiosConfig = {
        ...config,
        headers: {
            ...defaultHeaders,
            ...config.headers
        }
    }

    if(axiosConfig.method.toUpperCase() === "GET") {
        axiosConfig.params = config.data;
    } else {
        axiosConfig.data = config.data;
    }

    const url = `${CONST.Host}${root}${path}`;

    return axios({ url, ...axiosConfig })
        .then(response => {
            if (response.status !== STATUS_NO_CONTENT) {
                return response.data;
            }
        })
        .catch(err => {
            console.log(err);
        });
};

export default {
    postRequest,
    getRequest
}