import React from 'react';
import { GOOGLE_CLIENT_ID } from '../../constants';
import { useGoogleLogin } from 'react-google-login';
import { gql, useMutation } from '@apollo/client';
import UserContext from '../context/UserContext';
import MessageQueue from '../queues/MessageQueue';

const LOGIN_MUTATION = gql`
	mutation($idToken: String!) {
		login(idToken: $idToken)
	}
`;

const useAuth = () => {
	const [performLogin, { loading }] = useMutation(LOGIN_MUTATION);

	const user = React.useContext(UserContext);

	const { signIn } = useGoogleLogin({
		onSuccess: ({ tokenId }) => {
			performLogin({ variables: { idToken: tokenId } })
				.then(res => {
					localStorage.setItem('auth-jwt', res.data.login);
					user.refetch();
				})
				.catch(er => {
					MessageQueue.notify({
						body: er.message
					});
				});
		},
		clientId: GOOGLE_CLIENT_ID,
		isSignedIn: false,
		onFailure: () => {}
	});

	return {
		signIn,
		loading
	};
};

export default useAuth;
