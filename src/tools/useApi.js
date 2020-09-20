import axios from 'axios';
import React, { useCallback } from 'react';

import UserContext from '../comps/context/UserContext';
import { API_URL } from '../constants';

import ApiCache from './ApiCache';
import useIsOnline from './useIsOnline';
import { DateContext } from '../comps/context/DateProvider';

const maxAge = 1000 * 86400 * 14;

const useApi = (url, defaultVal = null, handleError = true) => {
	const context = React.useContext(UserContext);
	const date = React.useContext(DateContext);
	const isOnline = useIsOnline();

	const [storedInfo, setStoredInfo] = React.useState({
		data: defaultVal,
		checked: false,
		lastUpdated: date.getNow()
	});

	const [serverInfo, setServerInfo] = React.useState({
		data: null,
		checked: false,
		error: null,
		lastUpdated: date.getNow()
	});

	const [cancelTokenSource, setCancelTokenSource] = React.useState(
		axios.CancelToken.source()
	);

	// Renew the token if it has been used
	React.useEffect(() => {
		cancelTokenSource.token.promise.then(() => {
			setCancelTokenSource(axios.CancelToken.source());
		});
	}, [cancelTokenSource]);

	const updateData = useCallback(() => {
		const backend = axios.create({ baseURL: API_URL });

		backend.defaults.withCredentials = true;

		backend
			.get(url, { cancelToken: cancelTokenSource.token })
			.then(async res => {
				setServerInfo({
					data: res.data.payload,
					checked: true,
					error: false,
					lastUpdated: date.getNow()
				});

				await ApiCache.delete(url);

				await ApiCache.create(url, res.data.payload, date.getNow());
			})
			.catch(er => {
				if (!axios.isCancel(er)) {
					setServerInfo({
						data: null,
						checked: true,
						error: er,
						lastUpdated: date.getNow()
					});
				}
			});
	}, [url, cancelTokenSource.token, date]);

	React.useEffect(() => {
		if (!storedInfo.checked) {
			ApiCache.findOne(url).then(entry => {
				let data = defaultVal;
				let lastUpdated;

				if (entry !== null && entry?.date?.getTime()) {
					// Check to see if the data is expired
					const isFresh =
						new Date(entry.date.getTime() + maxAge) > date.getNow();
					data = isFresh ? entry.data : defaultVal;
					lastUpdated = date.getNow();
				}

				setStoredInfo({
					data,
					checked: true,
					lastUpdated
				});
			});
		}

		if (!serverInfo.checked && isOnline) {
			updateData();

			// If the component unmounts during the request, cancel the request
			// Also create a new cancel token source for the next attempt
			return () => {
				cancelTokenSource.cancel('Component unmounted');
			};
		}
	}, [
		context,
		url,
		defaultVal,
		isOnline,
		serverInfo,
		storedInfo,
		cancelTokenSource,
		updateData,
		date
	]);

	let data, updated, lastUpdated;

	if (!serverInfo.data) {
		data = storedInfo.data;
		lastUpdated = storedInfo.lastUpdated;
		updated = false;
	} else {
		data = serverInfo.data;
		lastUpdated = serverInfo.lastUpdated;
		updated = true;
	}

	const error = serverInfo.error;

	return {
		data,
		updated,
		updateData,
		lastUpdated,
		error
	};
};

export default useApi;
