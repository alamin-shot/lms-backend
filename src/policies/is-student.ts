export default async (policyContext: any, _config: any, { strapi }: any) => {
	const user = policyContext.state.user;

	if (!user) {
		return false;
	}

	const roleId = typeof user.role === 'object' ? user.role.id : user.role;
	const role = await strapi.db.query('plugin::users-permissions.role').findOne({
		where: { id: roleId },
	});

	const allowedRoles = ['Student', 'Instructor', 'Content Manager', 'Admin'];
	return role ? allowedRoles.includes(role.name) : false;
};
