import React from 'react';
import './App.css';

import Content from './pages';
import AppBar from './comps/menu/AppBar';
import NavDrawer from './comps/menu/NavDrawer';
import { BrowserRouter } from 'react-router-dom';
import UserProvider from './comps/context/UserProvider';

import { SnackbarQueue } from '@rmwc/snackbar';
import MessageQueue from './comps/queues/MessageQueue';
import '@material/snackbar/dist/mdc.snackbar.css';
import '@material/button/dist/mdc.button.css';
import Obfuscator from './comps/menu/Obfuscator';
import ThemeProvider from './comps/context/ThemeProvider';
import { DialogQueue as Dialogs } from '@rmwc/dialog';
import DialogQueue from './comps/queues/DialogQueue';
import '@rmwc/dialog/styles';
import ApolloProvider from './comps/context/ApolloProvider';
import DateProvider from './comps/context/DateProvider';

const App = () => {
	// If the device has a sufficiently large screen, the drawer is open by default
	const [drawerOpen, setDrawerOpen] = React.useState(window.innerWidth > 980);

	const toggleDrawer = newState => {
		if (!newState) {
			newState = !drawerOpen;
		}
		setDrawerOpen(newState);
	};

	window.onresize = event => {
		const shouldBeOpen = window.innerWidth > 980;

		if (event.isTrusted && drawerOpen !== shouldBeOpen) {
			setDrawerOpen(shouldBeOpen);
		}
	};

	return (
		<ApolloProvider>
			<DateProvider>
				<ThemeProvider>
					<BrowserRouter>
						<UserProvider>
							<AppBar toggleDrawer={toggleDrawer} />
							<NavDrawer
								drawerOpen={drawerOpen}
								toggleDrawer={toggleDrawer}
							>
								<Obfuscator
									open={drawerOpen && window.innerWidth < 800}
									toggleDrawer={toggleDrawer}
								/>
								<Content />
							</NavDrawer>
						</UserProvider>
					</BrowserRouter>

					<SnackbarQueue
						messages={MessageQueue.messages}
						dismissesOnAction
						timeout={4000}
					/>
					<Dialogs dialogs={DialogQueue.dialogs} />
				</ThemeProvider>
			</DateProvider>
		</ApolloProvider>
	);
};

export default App;
