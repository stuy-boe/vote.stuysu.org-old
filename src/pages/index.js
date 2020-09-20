import React from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';
import Elections from './elections';
import { Helmet } from 'react-helmet';
import { PUBLIC_URL } from '../constants';
import { sendPageView } from '../tools/GoogleAnalytics';
import Admin from './Admin';
import ErrorPage from './ErrorPage';
import SearchingVector from '../vectors/searching.svg';
import ElectionRouter from './election';
import layout from './../styles/Layout.module.css';
import voting from './../vectors/voting.svg';
import UserContext from '../comps/context/UserContext';
import { Button } from '@rmwc/button';
import google from '../img/icons/google.svg';
import useAuth from '../comps/utils/UseAuth';
import UnstyledLink from '../comps/utils/UnstyledLink';

const Content = () => {
	const location = useLocation();

	React.useEffect(sendPageView, [location]);

	return (
		<div>
			{/*(Mostly) Constant Open Graph Properties*/}
			<Helmet>
				<meta
					property="og:url"
					content={PUBLIC_URL + location.pathname}
				/>
				<meta
					property="og:site_name"
					content={'Stuyvesant Board of Elections Voting Site'}
				/>
				<meta property="og:type" content={'website'} />
				<meta
					property="og:description"
					content={
						'This is where voting as well as campaigning for Student Union elections takes place.'
					}
				/>
				<meta
					property="og:image"
					content={PUBLIC_URL + '/img/logo512.png'}
				/>
				<title>Stuy BOE Voting Site</title>
			</Helmet>

			<Switch>
				<Route path={'/'} component={Hello} exact />
				<Route path={'/elections'} component={Elections} />
				<Route path={'/election/:url'} component={ElectionRouter} />
				<Route path={'/admin'} component={Admin} />
				<Route path={'/'}>
					<ErrorPage
						image={SearchingVector}
						title={'Page Not Found'}
						subtitle={`We've looked everywhere...`}
					/>
				</Route>
			</Switch>
		</div>
	);
};

function Hello() {
	const user = React.useContext(UserContext);
	const { signIn, loading } = useAuth();

	return (
		<div>
			<Helmet>
				<title>{'Home | Stuy BOE Voting Site'}</title>
				<meta
					property="og:title"
					content={'Home | Stuy BOE Voting Site'}
				/>
			</Helmet>

			<div className={layout.container}>
				<main className={layout.main} style={{ textAlign: 'center' }}>
					<img
						src={voting}
						alt={'People voting'}
						style={{ width: '500px', maxWidth: '90%' }}
					/>
					<h2>Welcome To The Board of Elections Voting Site</h2>
					{user.signedIn ? (
						<UnstyledLink to={'/elections'}>
							<Button outlined>Check Out Elections</Button>
						</UnstyledLink>
					) : (
						<Button
							icon={{ icon: google, size: 'xlarge' }}
							outlined
							onClick={signIn}
							disabled={loading}
						>
							Sign In With Google
						</Button>
					)}
				</main>
			</div>
		</div>
	);
}

export default Content;
