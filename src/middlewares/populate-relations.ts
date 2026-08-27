import type { Core } from '@strapi/strapi';

const USER_UID = 'plugin::users-permissions.user';

const populateAuthenticatedUser = async (ctx: any, strapi: Core.Strapi) => {
	const isLogin = ctx.path === '/api/auth/local';
	const isMe = ctx.path === '/api/users/me';
	const userId = isLogin ? ctx.body?.user?.id : ctx.body?.id;

	if ((!isLogin && !isMe) || !userId) {
		return;
	}

	const user = await strapi.db.query(USER_UID).findOne({
		where: { id: userId },
		populate: {
			role: {
				fields: ['id', 'name', 'type', 'description'],
			},
		},
	});

	if (!user?.role) {
		return;
	}

	if (isLogin) {
		ctx.body.user = { ...ctx.body.user, role: user.role };
	} else {
		ctx.body = { ...ctx.body, role: user.role };
	}
};

export default (_config: unknown, { strapi }: { strapi: Core.Strapi }) => {
	return async (ctx: any, next: () => Promise<void>) => {
		if (ctx.path.startsWith('/api/')) {
			ctx.query.populate ??= '*';
		}

		await next();
		await populateAuthenticatedUser(ctx, strapi);
	};
};
