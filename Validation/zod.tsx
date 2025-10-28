import * as z from 'zod';

export const User = z.object({
	name: z.string(),
	surname: z.string(),
	email: z.string().email(),
	birthdate: z.string().refine((date) => {
		// Gère le format JJ/MM/AAAA
		const [day, month, year] = date.split(/[\/\-]/).map(Number);
		if (!day || !month || !year) return false;
		const birthDate = new Date(year, month - 1, day);
		if (isNaN(birthDate.getTime())) return false;
		const today = new Date();
		let age = today.getFullYear() - birthDate.getFullYear();
		const m = today.getMonth() - birthDate.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}
		return age >= 18;
	}),
	civility: z.enum(['madame', 'monsieur']),
	accept: z.literal(true, { message: 'Vous devez accepter les conditions' }),
	acceptNewsletter: z.boolean().optional(),
});
