'use strict';

const controller = {
	/**
	 * Submit a quiz with answers and get auto-graded score
	 */
	async submitQuiz(ctx: any) {
		const { quizId, answers } = ctx.request.body;
		const userId = ctx.state.user.id;

		if (!quizId || !answers) {
			return ctx.badRequest('Quiz ID and answers are required');
		}

		try {
			// 1. Get all questions for this quiz
			const questions = await strapi.db
				.query('api::question.question')
				.findMany({
					where: { quiz: quizId },
				});

			if (!questions || questions.length === 0) {
				return ctx.badRequest('No questions found for this quiz');
			}

			// 2. Grade the quiz
			let correctCount = 0;
			const results = questions.map((question: any, index: number) => {
				const userAnswer = answers[index] || null;
				const isCorrect = userAnswer === question.correctAnswer;
				if (isCorrect) correctCount++;
				return {
					questionId: question.id,
					userAnswer,
					correctAnswer: question.correctAnswer,
					isCorrect,
				};
			});

			const totalQuestions = questions.length;
			const score = Math.round((correctCount / totalQuestions) * 100);

			// 3. Save the attempt
			const attempt = await strapi.db
				.query('api::quiz-attempt.quiz-attempt')
				.create({
					data: {
						users_permissions_user: userId,
						quiz: quizId,
						score: score,
						answers,
					},
				});

			// 4. Return results
			return {
				id: attempt.id,
				score,
				correctCount,
				totalQuestions,
				results,
				passed: score >= 70,
			};
		} catch (error: any) {
			return ctx.badRequest('Error submitting quiz', { error: error.message });
		}
	},

	/**
	 * Get all attempts for a quiz by the current user
	 */
	async getAttempts(ctx: any) {
		const { quizId } = ctx.params;
		const userId = ctx.state.user.id;

		if (!quizId) {
			return ctx.badRequest('Quiz ID is required');
		}

		try {
			const attempts = await strapi.db
				.query('api::quiz-attempt.quiz-attempt')
				.findMany({
					where: {
						users_permissions_user: userId,
						quiz: quizId,
					},
					orderBy: { createdAt: 'desc' },
				});

			return attempts;
		} catch (error: any) {
			return ctx.badRequest('Error fetching attempts', {
				error: error.message,
			});
		}
	},
};

export default controller;
