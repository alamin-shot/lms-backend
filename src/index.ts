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
			// Progress routes
			{
				method: 'POST',
				path: '/api/progress/toggle',
				handler: progressController.toggleComplete,
				config: {
					policies: ['global::is-student'],
				},
			},
			{
				method: 'GET',
				path: '/api/progress/course/:courseId',
				handler: progressController.getProgress,
				config: {
					auth: false,
				},
			},
		]);
	},

	bootstrap(/* { strapi }: { strapi: Core.Strapi } */) {},
};
