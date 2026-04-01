import { z } from 'zod';
import { zodSchemaToMarkdown } from '../src/index';

// OpenAI Chat Message Schema Example
const messageSchema = z.discriminatedUnion('role', [
  z.object({
    role: z.literal('system'),
    content: z.string(),
    name: z.string().optional(),
  }),
  z.object({
    role: z.literal('user'),
    content: z.union([z.string(), z.array(z.object({
      type: z.literal('text'),
      text: z.string(),
    }))]),
    name: z.string().optional(),
  }),
  z.object({
    role: z.literal('assistant'),
    content: z.string().nullable(),
    tool_calls: z.array(z.object({
      id: z.string(),
      type: z.literal('function'),
      function: z.object({
        name: z.string(),
        arguments: z.string(),
      }),
    })).optional(),
    name: z.string().optional(),
  }),
  z.object({
    role: z.literal('tool'),
    content: z.union([z.string(), z.object({
      type: z.literal('image_url'),
      image_url: z.object({
        url: z.string(),
        detail: z.enum(['low', 'high', 'auto']).optional(),
      }),
    })]),
    tool_call_id: z.string(),
    name: z.string().optional(),
  }),
]);

const chatCompletionRequestSchema = z.object({
  model: z.string(),
  messages: z.array(messageSchema),
  temperature: z.number().min(0).max(2).optional(),
  top_p: z.number().min(0).max(1).optional(),
  n: z.number().int().min(1).optional(),
  stream: z.boolean().optional(),
  stop: z.union([z.string(), z.array(z.string())]).optional(),
  max_tokens: z.number().int().optional(),
  presence_penalty: z.number().min(-2).max(2).optional(),
  frequency_penalty: z.number().min(-2).max(2).optional(),
  logit_bias: z.record(z.string(), z.number()).optional(),
  user: z.string().optional(),
});

const schema = chatCompletionRequestSchema;
const markdown = zodSchemaToMarkdown(schema);

console.log(markdown);
