import axios from 'axios';
import { get as _get, set as _set } from 'lodash';
import { store } from '../App';
import * as actionTypes from '../store/actionTypes';

var axiosConfig = axios.create({
	baseURL: `${process.env.REACT_APP_NODE_BASE_URL}/v1`,
	headers: {
		'Content-Type': 'application/json'
	}
});

axiosConfig.interceptors.request.use(
	(axiosConf) => {
        const token = _get(store.getState(), 'session.token')
		if (token) _set(axiosConf, 'headers.Authorization', token);
		return axiosConf;
	},
	error => Promise.reject(error)
);

const interceptor = axiosConfig.interceptors.response.use(
		response => response,
		error => {
				// TODO:: implement Global error response handler here
				console.log(error)
				if (_get(error, 'response.status', 500) !== 401) {
						return Promise.reject(error);
				} 
				if (_get(error, 'response.status', 500) == 401) {
					localStorage.clear()
					store.dispatch({ type: actionTypes.SET_TOKEN_ACTION, payload: null })
					if(window.location.pathname.indexOf('preview') === -1)
						window.location.href = '/login'
				} 
				axiosConfig.interceptors.response.eject(interceptor);
                return;
		}
);

// Retry for network errors.
//axiosRetry(axiosConfig, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

export default axiosConfig;
