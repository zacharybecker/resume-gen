const TEMPLATE_PROMPTS: Record<string, string> = {
  modern: `## Template Style: Modern
- Clean, minimal layout with generous whitespace
- Sans-serif typography throughout
- Subtle coral (#FF6B6B) color accents for section headers and dividers
- Bold section headers with thin horizontal rules
- Compact but readable bullet points`,

  classic: `## Template Style: Classic
- Traditional, conservative layout
- Serif fonts for body text, sans-serif for headers
- Black and dark gray color scheme
- Centered name and contact header
- Clear section delineation with bold borders`,

  minimal: `## Template Style: Minimal
- Maximum whitespace, ultra-clean design
- Single column layout
- Very light gray separators
- Small, elegant typography
- Focus on content density with breathing room`,

  creative: `## Template Style: Creative
- Bold, distinctive typography with size contrast
- Two-column layout where appropriate
- Color accents for visual hierarchy
- Unique section treatments
- Skills displayed as visual tags/badges`,

  executive: `## Template Style: Executive
- Formal, dense, leadership-focused layout
- Dark header with white text for name/title
- Professional serif typography
- Emphasis on leadership achievements and scope
- Board memberships, publications sections if applicable`,

  technical: `## Template Style: Technical
- Skills-heavy layout with prominent technical skills section
- Monospace font accents for technical terms
- Project-focused with technology stack callouts
- GitHub/portfolio links prominently displayed
- Clean grid-based layout`,
};

export function getTemplatePrompt(templateId: string): string {
  return TEMPLATE_PROMPTS[templateId] || TEMPLATE_PROMPTS.modern;
}
