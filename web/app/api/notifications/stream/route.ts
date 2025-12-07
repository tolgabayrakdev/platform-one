import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:1234';

export async function GET(request: NextRequest) {
  try {
    // Cookie'leri al ve birleştir
    const cookieStore = await cookies();
    const cookiePairs: string[] = [];
    cookieStore.getAll().forEach((cookie) => {
      cookiePairs.push(`${cookie.name}=${cookie.value}`);
    });
    const cookieHeader = cookiePairs.join('; ') || request.headers.get('cookie') || '';
    
    // Backend'e SSE isteğini proxy et
    const response = await fetch(`${BACKEND_URL}/api/notifications/stream`, {
      headers: {
        // Cookie'leri ilet
        Cookie: cookieHeader,
        'Accept': 'text/event-stream',
      },
      credentials: 'include',
      // SSE için stream modunu etkinleştir
      cache: 'no-store',
    });

    if (!response.ok) {
      return new Response('SSE bağlantısı kurulamadı', { status: response.status });
    }

    // SSE stream'i client'a ilet
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              controller.close();
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            controller.enqueue(new TextEncoder().encode(chunk));
          }
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('SSE proxy error:', error);
    return new Response('SSE bağlantısı kurulamadı', { status: 500 });
  }
}
