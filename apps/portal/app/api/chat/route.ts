import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Chat API Route
 *
 * Handles chat messages and returns AI responses using RAG.
 *
 * CUSTOMIZE: Update the system prompt and behavior for your platform.
 */

interface ChatRequest {
  message: string;
  sessionId?: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
  tenantId?: string;
}

export async function POST(request: NextRequest) {
  // Check if AI is enabled
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return NextResponse.json(
      {
        success: false,
        error: 'Chat is not available',
        message: 'AI features are not configured for this platform.',
      },
      { status: 503 }
    );
  }

  try {
    const body: ChatRequest = await request.json();
    const { message, sessionId, history = [], tenantId } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set() {
            // Not needed for this route
          },
          remove() {
            // Not needed for this route
          },
        },
      }
    );

    // Get tenant from header (set by middleware)
    const tenantSlug = tenantId || request.headers.get('x-tenant-slug');

    // Dynamically import the AI package
    let chatResponse;
    try {
      const { chat, createSession } = await import('@listing-platform/ai');

      // Create a session if not provided
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        try {
          currentSessionId = await createSession(supabase, {
            tenantId: tenantSlug || undefined,
          });
        } catch {
          // Session creation failed, continue without
          console.warn('Could not create chat session');
        }
      }

      // Generate response using RAG
      chatResponse = await chat(message, {
        supabase,
        tenantId: tenantSlug || undefined,
        history: history.map((m) => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content,
        })),
        sessionId: currentSessionId || undefined,
      });

      return NextResponse.json({
        success: true,
        message: chatResponse.message,
        sessionId: chatResponse.sessionId || currentSessionId,
        contextCount: chatResponse.contextDocuments.length,
      });
    } catch (aiError) {
      console.error('AI package error:', aiError);

      // Fallback: Use OpenAI directly without RAG
      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({ apiKey: openaiKey });

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant for a listing platform. Help users find information and answer their questions.',
          },
          ...history.map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
          { role: 'user', content: message },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      return NextResponse.json({
        success: true,
        message: completion.choices[0]?.message?.content || 'I apologize, I could not generate a response.',
        sessionId,
        contextCount: 0,
      });
    }
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Chat failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler for health check
 */
export async function GET() {
  const isEnabled = !!process.env.OPENAI_API_KEY;

  return NextResponse.json({
    status: 'ok',
    endpoint: 'chat',
    enabled: isEnabled,
    methods: ['POST'],
  });
}
