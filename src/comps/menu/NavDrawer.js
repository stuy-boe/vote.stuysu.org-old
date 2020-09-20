import React from 'react';
import {
	Drawer,
	DrawerAppContent,
	DrawerContent,
	DrawerHeader,
	DrawerSubtitle,
	DrawerTitle
} from '@rmwc/drawer';
import '@material/drawer/dist/mdc.drawer.css';
import { List, SimpleListItem } from '@rmwc/list';

import '@material/list/dist/mdc.list.css';
import '@rmwc/list/collapsible-list.css';
import UserContext from '../context/UserContext';
import { useLocation } from 'react-router-dom';
import MenuItem from './MenuItem';

import { createUseStyles } from 'react-jss';
import ElectionItems from './ElectionItems';
import AdminItems from './AdminItems';
import useAuth from '../utils/UseAuth';
import { Icon } from '@rmwc/icon';
import google from '../../img/icons/google.svg';

const useStyles = createUseStyles({
	NavDrawer: {
		borderRight: 0,
		position: 'fixed'
	},
	DrawerAppContent: {
		padding: '1rem'
	},
	DrawerLogo: {
		paddingTop: '1em',
		width: '100px'
	}
});

const NavDrawer = ({ toggleDrawer, drawerOpen, children }) => {
	const { signIn, loading } = useAuth();
	const classes = useStyles();

	const user = React.useContext(UserContext);

	const location = useLocation();

	// On mobile devices, close the nav bar upon navigation
	const handleNavigation = () => {
		if (window.innerWidth < 800 && drawerOpen) {
			toggleDrawer(false);
		}
	};

	React.useEffect(handleNavigation, [location]);

	const attemptLogout = () => {
		window.localStorage.clear();
		user.refetch();
	};

	return (
		<div>
			<Drawer dismissible open={drawerOpen} className={classes.NavDrawer}>
				<DrawerHeader>
					<img
						src={'/img/logo100.png'}
						alt={'StuyBOE Logo'}
						className={classes.DrawerLogo}
					/>
					<DrawerTitle>
						{user.signedIn ? user.name : 'Not Signed In'}
					</DrawerTitle>
					<DrawerSubtitle>
						{user.signedIn ? user.email : ''}
					</DrawerSubtitle>
				</DrawerHeader>

				<DrawerContent className={['DrawerContent']}>
					<List>
						{user.signedIn ? (
							<SimpleListItem
								graphic="power_settings_new"
								text="Sign Out"
								onClick={attemptLogout}
							/>
						) : (
							<SimpleListItem
								disabled={loading}
								graphic={<Icon icon={google} />}
								text="Sign In With Google"
								onClick={signIn}
							/>
						)}

						{Boolean(user?.adminRoles) && <AdminItems />}

						{/*{user.signedIn && user.campaignManager.status && (*/}
						{/*	<MenuItem*/}
						{/*		to={'/campaign'}*/}
						{/*		text={'Campaign'}*/}
						{/*		icon={'assignment_ind'}*/}
						{/*		activeRoute={'/campaign'}*/}
						{/*	/>*/}
						{/*)}*/}

						<MenuItem
							to={'/'}
							text={'Home'}
							icon={'home'}
							activeRoute={'/'}
							exactRoute
						/>

						<ElectionItems />

						{/*<MenuItem*/}
						{/*	to={'/contact'}*/}
						{/*	text={'Contact Us'}*/}
						{/*	icon={'chat_bubble'}*/}
						{/*	activeRoute={'/contact'}*/}
						{/*/>*/}

						{/*<MenuItem*/}
						{/*	to={'/help'}*/}
						{/*	text={'Help'}*/}
						{/*	icon={'help'}*/}
						{/*	activeRoute={'/help'}*/}
						{/*/>*/}
					</List>
				</DrawerContent>
			</Drawer>

			<DrawerAppContent className={classes.DrawerAppContent}>
				{children}
			</DrawerAppContent>
		</div>
	);
};

export default NavDrawer;
