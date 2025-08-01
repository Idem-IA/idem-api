export const LOGO_GENERATION_PROMPT = `
You are a senior expert logo designer specializing in high-end SVG vector logos for tech brands. Generate 4 (four) distinct logo propositions. Each proposition must be a complete, ready-to-use design following the Sozy branding template style.

STRICT OUTPUT FORMAT (JSON ONLY — DO NOT CHANGE STRUCTURE):
You MUST output a valid JSON array containing exactly 4 logo proposition objects. Each object in the array must strictly adhere to the following structure:
[
  {
    \"id\": \"<UNIQUE_PROPOSITION_ID_STRING>\", // e.g., "logo_prop_01"
    \"name\": \"<DESCRIPTIVE_LOGO_NAME>\", // e.g., "Synergy Spark"
    \"svg\": \"<SVG_CODE_FOR_MAIN_LOGO>\",
    \"concept\": \"<BRANDING_STORY_OR_MEANING>\",
    \"colors\": [\"#PRIMARY_HEX\", \"#ACCENT_HEX_OPTIONAL\"],
    \"fonts\": [\"FONT_FAMILY_NAME_IF_USED\"],
    \"variations\": { // Required for matching the template
      \"lightBackground\": \"<SVG_CODE_FOR_LIGHT_BACKGROUND_VERSION>\",
      \"darkBackground\": \"<SVG_CODE_FOR_DARK_BACKGROUND_VERSION>\",
      \"monochrome\": \"<SVG_CODE_FOR_MONOCHROME_VERSION>\"
    }
  }
  // ... (ensure a total of 4 such objects in the array)
]

IMPORTANT:
- **Strictly respect the JSON array structure** with exactly 4 objects.
- Each object must follow the specified fields.
- Escape all quotes and special characters properly within JSON strings (e.g., \\\" for quotes, \\\\ for backslash).
- The 'variations' object is REQUIRED to match the Sozy branding template style.

TECHNICAL REQUIREMENTS (apply to each of the 4 propositions):

1. SVG SPECS (for \"svg\" and all variation SVGs):
- ViewBox must be exactly: 0 0 120 40
- Clean and minimal SVG markup (no extra groups, metadata, or hidden elements)
- Optimized path complexity: under 50 nodes if possible
- Semantic IDs must be used if applicable: e.g., 'logo-icon' for the symbol, 'logo-text' for the brand name text
- Ensure pixel-perfect rendering from 24px up to 192px
- Include a modern, premium feel with subtle gradient effects similar to the Sozy brand template
- No external resources or references

2. DESIGN RULES (for each proposition):
- Use a primary color and accent color that match the gradient style from the Sozy template (e.g.,  [primaryColor] to [secondaryColor])
- 1 font family maximum, preferably 'Exo 2' to match the template, or another premium Google Font
- Strong and creative use of **negative space** and **geometric balance**
- Bold, recognizable shapes that remain legible and memorable at small sizes (minimum 16px)
- Clear storytelling: the symbol/design must visually represent the brand values (trust, innovation, accessibility)
- No overused icons (no light bulbs, gears, clouds, generic tech clichés)
- High color contrast for accessibility (WCAG AA compliance)
- Clean, modern design with subtle gradients and premium aesthetics similar to the Sozy brand template example
- The overall aesthetic must be highly polished, professional, and convey a sense of premium quality

3. VARIATIONS (REQUIRED FOR EACH PROPOSITION):
Provide all the following variations to match the Sozy template:
- Light background version: original colors on transparent, optimized for light backgrounds
- Dark background version: adapted colors for dark UIs (inverted if needed), optimized for dark backgrounds
- Monochrome version: pure black or pure white, no gradients

4. QUALITY CHECKS (for each proposition's SVGs):
- Validate all SVG files (e.g., using an online SVG validator)
- Test readability and clarity from 24px to 192px
- Confirm the logo can adapt inside a square area if necessary (social media usage)
- Confirm printing compatibility (no strokes too thin, no low-contrast issues)
- Ensure the overall style matches the premium, modern aesthetic of the Sozy brand template with subtle gradients and clean lines

CONTENT DETAILS (for each proposition object in the JSON array):
- \"id\": A unique identifier string for the proposition (e.g., "prop_alpha", "logo_v1").
- \"name\": A short, descriptive name for the logo concept (e.g., "Quantum Leap", "Unity Weave").
- \"svg\": Main version with original colors (full SVG code).
- \"concept\": Short 2-3 sentence explanation of the symbolism and design choices.
- \"colors\": Array of 1–2 HEX codes used in the main SVG.
- \"fonts\": Array containing the Google Fonts font name if a font is used; empty array [] if no font.
- \"variations\": (Optional object) If included, provide full SVG code for each specified variant.

PROJECT CONTEXT:
The logo propositions are for a premium tech brand named Sozy that aims to communicate trust, simplicity, and forward-thinking. Each logo must feel high-end, unique, modern, sleek, and highly professional. The aesthetic should match the Sozy brand template style with modern gradients ([primaryColor] to [secondaryColor]), clean typography (using Exo 2 font), and premium design elements. The style should align with leading contemporary tech brands, suitable for premium digital products and global recognition.

EXAMPLE OUTPUT (structure for one proposition within the array of 4):
[
  {
    \"id\": \"stellar_nexus_01\",
    \"name\": \"Stellar Nexus\",
    \"svg\": \"<svg viewBox='0 0 120 40' xmlns='http://www.w3.org/2000/svg'><path id='logo-icon' fill='#3A86FF' d='M20,20L40,40Z'/><text id='logo-text' font-family='Inter' fill='#333' x='50' y='28'>Brand</text></svg>\",
    \"concept\": \"This logo features an abstract star form, representing innovation and guidance. The interconnected lines symbolize robust networking and reliability, key to the brand's tech focus.\",
    \"colors\": [\"#3A86FF\", \"#1E2A3B\"],
    \"fonts\": [\"Inter\"],
    \"variations\": {
      \"lightBackground\": \"<svg viewBox='0 0 120 40' ...></svg>\", // Full SVG code
      \"darkBackground\": \"<svg viewBox='0 0 120 40' ...></svg>\",  // Full SVG code
      \"monochrome\": \"<svg viewBox='0 0 120 40' ...></svg>\"     // Full SVG code
    }
  }
  // ... plus 3 more similar objects
]
`;
