import { describe, it, expect } from 'vitest';
import { PromptEcho } from './prompt-echo';

describe('P0_LIDLESS_LEGION Sub 6: Prompt Echo', () => {
  const echo = new PromptEcho();

  it('should detect instruction blocks', () => {
    const context = echo.echo('This is a test with <instructions>inside</instructions>');
    expect(context.hasInstructions).toBe(true);
  });

  it('should calculate character count', () => {
    const context = echo.echo('12345');
    expect(context.characterCount).toBe(5);
  });
});
