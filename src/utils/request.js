/**
 * request.js handles all requests to the backend
 */
import CONST from "./constants";
import { encode } from "base-64";
import axios, {formToJSON} from "axios";

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
 * @returns Promise
 */
const getRequest = path => {
    return _createRequest(path, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
        data: {}
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
    console.log("axiosConfig", axiosConfig);
    if(axiosConfig.method.toUpperCase() === "GET") {
        axiosConfig.params = config.data;
    } else {
        axiosConfig.data = config.data;
    }

    const url = `${CONST.Host}${root}${path}`;

    return axios({ url, ...axiosConfig })
        .then(response => {
            if (response.status === 200 || response.status === 204) {
                return response.data ? JSON.stringify(response.data) : null;
            }

            let errorMessage;
            switch (response.status) {
                case 400:
                    errorMessage = 'Bad request. Please check your input.';
                    break;
                case 401:
                    errorMessage = 'Unauthorized. Please login again.';
                    break;
                case 403:
                    errorMessage = 'Forbidden. You do not have permission to access this resource.';
                    break;
                case 404:
                    errorMessage = 'Not found. The requested resource does not exist.';
                    break;
                default:
                    // Log unexpected status code
                    console.error(`Unexpected status code: ${response.status}`);
                    errorMessage = 'An unexpected error occurred. Please try again later.';
            }
            throw new Error(errorMessage);
        })
        .catch(err => {
            console.log(err.message);
        });
};

export default {
    postRequest,
    getRequest
}