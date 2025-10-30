import * as z from "zod";

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
  civility: z.enum(["madame", "monsieur"]),
  accept: z.literal(true, { message: "Vous devez accepter les conditions" }),
  acceptNewsletter: z.boolean().optional(),
});

// Define the session payload schema
export const sessionPayloadSchema = z.object({
  userId: z.string().uuid(), // User ID as a UUID
  email: z.string().email(), // User email
  firstLevelStars: z.number().min(0).optional(), // First level stars (optional)
  secondLevelStars: z.number().min(0).optional(), // Second level stars (optional)
  thirdLevelStars: z.number().min(0).optional(), // Third level stars (optional)
  fourthLevelStars: z.number().min(0).optional(), // Fourth level stars (optional)
  finisdhedAt: z.string().optional(), // Which time the user finished the game (empty string if not finished)
  createdAt: z.string().datetime(), // Session creation timestamp
  subsidary: z.string().optional(), // User's subsidary (optional)
  expiresAt: z.date(), // Session expiration timestamp
});

// Example usage
export type SessionPayload = z.infer<typeof sessionPayloadSchema>;
