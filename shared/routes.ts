import { z } from 'zod';
import { insertDonorSchema, donors } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  donors: {
    list: {
      method: 'GET' as const,
      path: '/api/donors',
      input: z.object({
        bloodGroup: z.string().optional(),
        city: z.string().optional(),
        userType: z.enum(["donor", "receiver"]).optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<Omit<typeof donors.$inferSelect, "contactNumber">>()), // Public info only
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/donors',
      input: insertDonorSchema,
      responses: {
        201: z.custom<typeof donors.$inferSelect>(), // Private info returned to creator
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    getMine: {
      method: 'GET' as const,
      path: '/api/donors/me',
      responses: {
        200: z.custom<typeof donors.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized
      }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/donors/me',
      input: insertDonorSchema.partial(),
      responses: {
        200: z.custom<typeof donors.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
