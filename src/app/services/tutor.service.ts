import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { FirebaseService } from './firebase.service';
import { UserService } from './user.service';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface TutorContext {
  learnerName: string;
  language?: string;
  lessonTitle?: string;
  lessonContent?: string;
  code?: string;
}

@Injectable({ providedIn: 'root' })
export class TutorService {
  private fb = inject(FirebaseService);
  private users = inject(UserService);

  buildSystemPrompt(ctx: TutorContext): string {
    const lessonBlock = ctx.lessonTitle
      ? `\nThe learner is currently on the lesson "${ctx.lessonTitle}"${ctx.language ? ` (${ctx.language})` : ''}.` +
        (ctx.lessonContent ? `\nLesson material:\n"""\n${ctx.lessonContent.slice(0, 2500)}\n"""` : '')
      : '';
    const codeBlock = ctx.code ? `\nThe learner's current code:\n\`\`\`\n${ctx.code.slice(0, 2000)}\n\`\`\`` : '';
    return (
      `You are DevJ, a warm, upbeat, and encouraging coding tutor for ${ctx.learnerName}. ` +
      `You teach JavaScript, Python, and SQL from beginner to mastery. ` +
      `Be concise and friendly, use the learner's name occasionally, celebrate progress, and never shame mistakes. ` +
      `Prefer guiding questions and small hints over dumping full solutions unless explicitly asked. ` +
      `Use short Markdown with fenced code blocks. Sprinkle the occasional emoji, but stay focused and practical.` +
      lessonBlock +
      codeBlock
    );
  }

  /** Streams the assistant reply; calls onDelta with each text chunk. Returns the full text. */
  async streamChat(
    messages: ChatMessage[],
    ctx: TutorContext,
    onDelta?: (chunk: string) => void,
  ): Promise<string> {
    this.fb.track('tutor_message', { lesson: ctx.lessonTitle ?? 'general' });
    const model = this.users.profile()?.settings.tutorModel || undefined;
    const res = await fetch(environment.tutorApiUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages, system: this.buildSystemPrompt(ctx), model }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error || `The tutor is unavailable right now (status ${res.status}).`);
    }

    if (!res.body) {
      const text = await res.text();
      onDelta?.(text);
      return text;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = '';
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      full += chunk;
      onDelta?.(chunk);
    }
    return full;
  }

  // ── Convenience prompts used by the lesson UI ──────────────────
  explainSimpler(topic: string): ChatMessage {
    return { role: 'user', content: `Can you explain "${topic}" in a simpler way, like I'm new to programming? Use a tiny everyday analogy.` };
  }
  hintFor(instructions: string): ChatMessage {
    return { role: 'user', content: `I'm stuck on this exercise: "${instructions}". Give me ONE small hint to move forward — please don't write the full solution.` };
  }
  reviewCode(): ChatMessage {
    return { role: 'user', content: `Please review my current code. Point out one thing I did well and one concrete improvement, kindly.` };
  }
  practiceQuestion(topic: string): ChatMessage {
    return { role: 'user', content: `Give me one short practice question about "${topic}" to test my understanding. Wait for my answer before revealing the solution.` };
  }
}
