// src/lib/validations.ts
import { z } from 'zod';

export const ServiceSchema = z.object({
  name: z.string().min(3, "اسم الخدمة يجب أن يكون 3 أحرف على الأقل"),
  price: z.number().min(1, "السعر يجب أن يكون أكبر من 0"),
  duration: z.number().min(5, "المدة يجب أن تكون 5 دقائق على الأقل"),
  isActive: z.boolean(),
});

export type ServiceFormValues = z.infer<typeof ServiceSchema>;