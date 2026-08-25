'use strict';

const controller = {
	async toggleComplete(ctx: any) {
		const { lessonId } = ctx.request.body;
		const userId = ctx.state.user.id;

		if (!lessonId) {
			return ctx.badRequest('Lesson ID is required');
		}

		try {
			let progress = await strapi.db.query('api::progress.progress').findOne({
				where: {
					users_permissions_user: userId,
					lesson: lessonId,
				},
			});

			let isCompleted;

			if (progress) {
				isCompleted = !progress.completed;
				progress = await strapi.db.query('api::progress.progress').update({
					where: { id: progress.id },
					data: { completed: isCompleted },
				});
			} else {
				isCompleted = true;
				progress = await strapi.db.query('api::progress.progress').create({
					data: {
						users_permissions_user: userId,
						lesson: lessonId,
						completed: true,
					},
				});
			}

			const lesson = await strapi.db.query('api::lesson.lesson').findOne({
				where: { id: lessonId },
				populate: { course: true },
			});

			if (!lesson) {
				return ctx.notFound('Lesson not found');
			}

			const courseLessons = await strapi.db
				.query('api::lesson.lesson')
				.findMany({
					where: { course: lesson.course.id },
				});

			const completedLessons = await strapi.db
				.query('api::progress.progress')
				.findMany({
					where: {
						users_permissions_user: userId,
						completed: true,
						lesson: { course: lesson.course.id },
					},
				});

			const percentage =
				courseLessons.length > 0
					? (completedLessons.length / courseLessons.length) * 100
					: 0;

			return {
				progress,
				courseProgress: Math.round(percentage),
				completedCount: completedLessons.length,
				totalCount: courseLessons.length,
			};
		} catch (error: any) {
			return ctx.badRequest('Error updating progress', {
				error: error.message,
			});
		}
	},

	async getProgress(ctx: any) {
		const { courseId } = ctx.params;
		const userId = ctx.state.user.id;

		if (!courseId) {
			return ctx.badRequest('Course ID is required');
		}

		try {
			const progress = await strapi.db
				.query('api::progress.progress')
				.findMany({
					where: {
						user: userId,
						lesson: { course: courseId },
					},
					populate: { lesson: true },
				});

			return progress;
		} catch (error: any) {
			return ctx.badRequest('Error fetching progress', {
				error: error.message,
			});
		}
	},
};

export default controller;
