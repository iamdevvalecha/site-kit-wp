/**
 * Modal component.
 *
 * Site Kit by Google, Copyright 2021 Google LLC
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
import { useMount } from 'react-use';

/**
 * WordPress dependencies
 */
import { createPortal, useState } from '@wordpress/element';

function Modal( { children } ) {
	// Using state as we need `el` to not change when the component re-renders
	const [ el ] = useState( document.createElement( 'div' ) );

	useMount( () => {
		const root = document.querySelector( '.googlesitekit-plugin' ) || document.body;
		root.appendChild( el );

		return () => root.removeChild( el );
	} );

	return createPortal(
		children,
		el,
	);
}

export default Modal;
