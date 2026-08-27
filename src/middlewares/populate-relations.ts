import type { Core } from '@strapi/strapi';

const USER_UID = 'plugin::users-permissions.user';

const populateAuthenticatedLoginUser = async (
	ctx: any,
	strapi: Core.Strapi,
) => {
	if (ctx.path !== '/api/auth/local' || !ctx.body?.user?.id) {
		return;
	}

	const user = await strapi.db.query(USER_UID).findOne({
		where: { id: ctx.body.user.id },
		populate: ['role'],
	});

	if (!user) {
		return;
	}

	const sanitizedUser = await strapi.contentAPI.sanitize.output(
		user,
		strapi.getModel(USER_UID),
		{ auth: ctx.state.auth },
	);

	ctx.body.user = sanitizedUser;
};

export default (_config: unknown, { strapi }: { strapi: Core.Strapi }) => {
	return async (ctx: any, next: () => Promise<void>) => {
		if (ctx.path.startsWith('/api/')) {
			ctx.query.populate ??= '*';
		}

		await next();
		await populateAuthenticatedLoginUser(ctx, strapi);
	};
};
