import { z } from 'zod';

export const memberSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[\d\s-]{10,}$/, "Invalid phone format").optional().or(z.literal('')),
  planId: z.string().min(1, "Please select a membership plan"),
  gender: z.enum(['male', 'female', 'other']),
  dateOfBirth: z.string().optional().or(z.literal('')),
});

export const programSchema = z.object({
  name: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  durationWeeks: z.number().positive("Duration must be at least 1 week"),
  daysPerWeek: z.number().min(1).max(7, "Max 7 days per week"),
});
