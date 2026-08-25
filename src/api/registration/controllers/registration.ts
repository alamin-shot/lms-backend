const ALLOWED_ROLES = ['Student', 'Instructor', 'Content Manager'];

export default {
	async register(ctx: any) {
		console.log('Request body:', ctx.request.body);

		const { username, email, password, role } = ctx.request.body;

		if (!username || !email || !password || !role) {
			return ctx.badRequest('All fields are required');
		}

		if (!ALLOWED_ROLES.includes(role)) {
			return ctx.badRequest('Invalid role for registration');
		}

		const roleEntry = await strapi.db
			.query('plugin::users-permissions.role')
			.findOne({
				where: { name: role },
			});

		if (!roleEntry) {
			return ctx.badRequest('Role not found');
		}

		try {
			const userService = strapi.plugin('users-permissions').service('user');
			const jwtService = strapi.plugin('users-permissions').service('jwt');

			const user = await userService.add({
				username,
				email,
				password,
				provider: 'local',
				confirmed: true,
			});

			await strapi.db.query('plugin::users-permissions.user').update({
				where: { id: user.id },
				data: { role: roleEntry.id },
			});

			const jwt = await jwtService.issue({ id: user.id });

			return {
				jwt,
				user: {
					id: user.id,
					username: user.username,
					email: user.email,
					role,
				},
			};
		} catch (error: any) {
			return ctx.badRequest('Registration failed', { error: error.message });
		}
	},
};
