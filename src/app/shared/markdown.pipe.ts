import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: false });

/** Renders trusted, app-authored Markdown (curriculum + AI replies) to HTML. */
@Pipe({ name: 'markdown' })
export class MarkdownPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  transform(value: string | null | undefined): SafeHtml {
    const html = value ? (marked.parse(value, { async: false }) as string) : '';
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
