import type { Core } from '@strapi/strapi';
import registrationController from './api/registration/controllers/registration';
import progressController from './api/progress/controllers/progress';

export default {
	register({ strapi }: { strapi: Core.Strapi }) {
		strapi.server.routes([
			// Registration route
			{
				method: 'POST',
				path: '/api/registration/register',
				handler: registrationController.register,
				config: {
					auth: false,
				},
			},
		]);

		strapi.server.routes({
			type: 'content-api',
			routes: [
				{
					method: 'POST',
					path: '/progress/actions/toggle',
					handler: progressController.toggleComplete,
					info: { type: 'content-api' },
					config: {
						policies: ['global::is-student'],
					},
				},
				{
					method: 'GET',
					path: '/progress/course/:courseId',
					handler: progressController.getProgress,
					info: { type: 'content-api' },
					config: {},
				},
			],
		});
	},

	bootstrap(/* { strapi }: { strapi: Core.Strapi } */) {},
};
