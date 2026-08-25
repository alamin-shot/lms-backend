export default {
	routes: [
		{
			method: 'POST',
			path: '/register',
			handler: 'registration.register',
			config: {
				auth: false,
			},
		},
	],
};
