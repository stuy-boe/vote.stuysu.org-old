import React from 'react';
import UserContext from '../../../comps/context/UserContext';
import { Redirect, Route, Switch } from 'react-router-dom';
import AdminElectionsRouter from '../../../comps/admin/AdminElectionsRouter';
import AccessDeniedVector from '../../../vectors/x-on-laptop.svg';
import SignInVector from '../../../vectors/carrying-key.svg';
import ErrorPage from '../../ErrorPage';
import useAuth from '../../../comps/utils/UseAuth';
import FlexCenter from '../../../comps/utils/FlexCenter';
import { Button } from '@rmwc/button';
import google from '../../../img/icons/google.svg';
import Updates from './updates';

const Admin = ({ match }) => {
	const { signIn, loading } = useAuth();
	const user = React.useContext(UserContext);
	if (!user.signedIn) {
		return (
			<ErrorPage
				title={'Sign In Required'}
				image={SignInVector}
				subtitle={
					<span>
						You need to be signed in to access that page. <br />
					</span>
				}
			>
				<FlexCenter>
					<Button
						icon={{ icon: google, size: 'xlarge' }}
						outlined
						onClick={signIn}
						disabled={loading}
					>
						Sign In With Google
					</Button>
				</FlexCenter>
			</ErrorPage>
		);
	}

	// TODO: make this route pretty for non-admins
	if (!user.adminRoles?.length) {
		return (
			<ErrorPage
				title={'Access Denied'}
				image={AccessDeniedVector}
				subtitle={'Let us know if this is a mistake!'}
			/>
		);
	}

	return (
		<div>
			<Switch>
				<Route path={match.path} exact>
					<Redirect to={`${match.path}/updates`} />
				</Route>
				<Route path={`${match.path}/updates`} component={Updates} />
			</Switch>
		</div>
	);
};

export default Admin;
