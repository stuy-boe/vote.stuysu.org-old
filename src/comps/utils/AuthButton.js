import React from 'react';
import { GOOGLE_CLIENT_ID } from '../../constants';
import { useGoogleLogin } from 'react-google-login';
import { Icon } from '@rmwc/icon';
import google from '../../img/icons/google.svg';
import { SimpleListItem } from '@rmwc/list';
import { gql, useMutation } from '@apollo/client';
import UserContext from '../context/UserContext';

const LOGIN_MUTATION = gql`
	mutation($idToken: String!) {
		login(idToken: $idToken)
	}
`;

const AuthButton = () => {
	const [performLogin, { loading }] = useMutation(LOGIN_MUTATION);

	const user = React.useContext(UserContext);

	const { signIn } = useGoogleLogin({
		onSuccess: ({ tokenId }) => {
			performLogin({ variables: { idToken: tokenId } }).then(res => {
				localStorage.setItem('auth-jwt', res.data.login);
				user.refetch();
			});
		},
		clientId: GOOGLE_CLIENT_ID,
		isSignedIn: false,
		onFailure: () => {}
	});

	return (
		<SimpleListItem
			disabled={loading}
			graphic={<Icon icon={google} />}
			text="Sign In With Google"
			onClick={signIn}
		/>
	);
};

export default AuthButton;
