import React from 'react';
import MenuItem from './MenuItem';
import { CollapsibleList, SimpleListItem } from '@rmwc/list';
import UserContext from '../context/UserContext';
import { useLocation, useRouteMatch } from 'react-router-dom';

const meta = {
	// elections: {
	// 	icon: 'poll',
	// 	title: 'Elections'
	// },
	updates: {
		icon: 'find_in_page',
		title: 'Updates Approval'
	}
};

const AdminItems = () => {
	const adminBaseRoute = `/admin`;
	const routeMatch = useRouteMatch(adminBaseRoute);
	const [isOpen, setIsOpen] = React.useState(Boolean(routeMatch));
	const user = React.useContext(UserContext);
	const location = useLocation();

	const privileges = user.adminRoles || [];

	const handleNavigationOut = () => {
		if (isOpen && !routeMatch) {
			setIsOpen(false);
		}
	};

	React.useEffect(handleNavigationOut, [routeMatch, location]);

	return (
		<CollapsibleList
			handle={
				<SimpleListItem
					activated={routeMatch && routeMatch.isExact}
					text={'Admin'}
					graphic={'build'}
					metaIcon={'chevron_right'}
				/>
			}
			onClick={() => {
				if (!routeMatch) {
					setIsOpen(!isOpen);
				}
			}}
			open={isOpen || routeMatch}
		>
			{privileges.map(privilege => {
				if (!meta[privilege]) {
					return null;
				}

				return (
					<MenuItem
						to={`${adminBaseRoute}/${privilege}`}
						text={meta[privilege].title}
						activeRoute={`${adminBaseRoute}/${privilege}`}
						icon={meta[privilege].icon}
						key={privilege}
					/>
				);
			})}
		</CollapsibleList>
	);
};

export default AdminItems;
