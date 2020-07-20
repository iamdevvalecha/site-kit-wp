/**
 * modules/adsense data store: report.
 *
 * Site Kit by Google, Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * External dependencies
 */
import invariant from 'invariant';
import isPlainObject from 'lodash/isPlainObject';

/**
 * Internal dependencies
 */
import API from 'googlesitekit-api';
import Data from 'googlesitekit-data';
import { STORE_NAME } from './constants';
import { stringifyObject } from '../../../util';
import { createFetchStore } from '../../../googlesitekit/data/create-fetch-store';
import { isValidDateRange } from '../../../util/report-validation';

const fetchGetReportStore = createFetchStore( {
	baseName: 'getReport',
	controlCallback: ( { options } ) => {
		return API.get( 'modules', 'adsense', 'earnings', options );
	},
	reducerCallback: ( state, report, { options } ) => {
		return {
			...state,
			reports: {
				...state.reports,
				[ stringifyObject( options ) ]: report,
			},
		};
	},
	argsToParams: ( options ) => {
		const {
			startDate,
			endDate,
			dateRange,
		} = options;

		invariant( isPlainObject( options ), 'options must be an object.' );
		invariant( isValidDateRange( dateRange, startDate, endDate ), 'Either date range or start/end dates must be provided for AdSense report.' );

		return { options };
	},
} );

const BASE_INITIAL_STATE = {
	reports: {},
};

const baseResolvers = {
	*getReport( options = {} ) {
		const registry = yield Data.commonActions.getRegistry();
		const existingReport = registry.select( STORE_NAME ).getReport( options );

		// If there are already alerts loaded in state, consider it fulfilled
		// and don't make an API request.
		if ( existingReport ) {
			return;
		}

		yield fetchGetReportStore.actions.fetchGetReport( options );
	},
};

const baseSelectors = {
	/**
	 * Gets a Google AdSense report for the given options.
	 *
	 * The report generated will include the following metrics:
	 * * 'EARNINGS'
	 * * 'PAGE_VIEWS_RPM'
	 * * 'IMPRESSIONS'
	 *
	 * @since 1.9.0
	 *
	 * @param {Object}         state              Data store's state.
	 * @param {Object}         options            Optional. Options for generating the report.
	 * @param {string}         options.startDate  Required, unless dateRange is provided. Start date to query report data for as YYYY-mm-dd.
	 * @param {string}         options.endDate    Required, unless dateRange is provided. Start date to query report data for as YYYY-mm-dd.
	 * @param {string}         options.dateRange  Required, alternatively to startDate and endDate. A date range string. Default 'last-28-days'.
	 * @param {Array.<string>} options.metrics    Required. List of metrics to query.
	 * @param {Array.<string>} options.dimensions Optional. List of dimensions to group results by.
	 * @param {Array.<Object>} options.orderby    Optional. Order definition objects containing 'fieldName' and 'sortOrder'. 'sortOrder' must be either 'ASCENDING' or 'DESCENDING'. Default null.
	 * @param {number}         options.limit      Optional. Maximum number of entries to return. Default 1000.
	 * @return {(Array.<Object>|undefined)} An AdSense report; `undefined` if not loaded.
	 */
	getReport( state, options = {} ) {
		const { reports } = state;

		return reports[ stringifyObject( options ) ];
	},
};

const store = Data.combineStores(
	fetchGetReportStore,
	{
		INITIAL_STATE: BASE_INITIAL_STATE,
		resolvers: baseResolvers,
		selectors: baseSelectors,
	}
);

export const INITIAL_STATE = store.INITIAL_STATE;
export const actions = store.actions;
export const controls = store.controls;
export const reducer = store.reducer;
export const resolvers = store.resolvers;
export const selectors = store.selectors;

export default store;
