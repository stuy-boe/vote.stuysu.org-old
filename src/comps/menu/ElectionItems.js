import React from 'react';
import { SimpleListItem } from '@rmwc/list';
import { Link, useRouteMatch } from 'react-router-dom';

const ElectionItems = () => {
	const onElectionsPage = useRouteMatch('/elections');
	const onElectionPage = useRouteMatch('/election');

	return (
		<Link to={'/elections'}>
			<SimpleListItem
				activated={onElectionsPage || onElectionPage}
				text={'Elections'}
				graphic={'how_to_vote'}
			/>
		</Link>
	);
};

export default ElectionItems;
