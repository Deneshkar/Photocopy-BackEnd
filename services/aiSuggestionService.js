/**
 * Simple keyword-based AI suggestion service
 * This is not a real AI API.
 * It uses easy rules to generate useful print suggestions.
 */

// Allowed values to keep output safe and consistent
const ALLOWED_PAPER_SIZES = ["A4", "A3"];
const ALLOWED_PRINT_TYPES = ["Black & White", "Color"];
const ALLOWED_SIDES = ["Single-sided", "Double-sided"];
const ALLOWED_BINDINGS = ["None", "Spiral Binding", "Stapled"];
const ALLOWED_LAMINATION = ["Yes", "No"];
const ALLOWED_ORIENTATIONS = ["Portrait", "Landscape"];

/**
 * Extract page count from text
 * Supports examples like:
 * - 20 pages
 * - 30-page
 * - 50 page report
 */
function extractPageCount(text) {
  const match = text.match(/(\d+)\s*[- ]?\s*page[s]?/i);
  if (match) {
    return Number(match[1]);
  }
  return null;
}

/**
 * Check if text contains any keyword from a list
 */
function containsAny(text, keywords) {
  return keywords.some((word) => text.includes(word));
}

/**
 * Validate and sanitize final suggestion object
 */
function sanitizeSuggestions(data) {
  return {
    paperSize: ALLOWED_PAPER_SIZES.includes(data.paperSize) ? data.paperSize : "A4",
    printType: ALLOWED_PRINT_TYPES.includes(data.printType) ? data.printType : "Black & White",
    sides: ALLOWED_SIDES.includes(data.sides) ? data.sides : "Single-sided",
    copies: Number.isInteger(data.copies) && data.copies > 0 ? data.copies : 1,
    binding: ALLOWED_BINDINGS.includes(data.binding) ? data.binding : "None",
    lamination: ALLOWED_LAMINATION.includes(data.lamination) ? data.lamination : "No",
    orientation: ALLOWED_ORIENTATIONS.includes(data.orientation) ? data.orientation : "Portrait",
    notes: typeof data.notes === "string" ? data.notes : "",
  };
}

/**
 * Main function
 */
function generatePrintSuggestions(message) {
  const text = message.toLowerCase();
  const pageCount = extractPageCount(text);

  // Safe default suggestions
  const suggestions = {
    paperSize: "A4",
    printType: "Black & White",
    sides: "Single-sided",
    copies: 1,
    binding: "None",
    lamination: "No",
    orientation: "Portrait",
    notes: "Default print suggestion for a standard document.",
  };

  // Keyword groups
  const academicKeywords = [
    "assignment",
    "report",
    "project",
    "thesis",
    "research",
    "university",
    "school",
    "submission",
    "final report",
    "document",
  ];

  const photoKeywords = [
    "photo",
    "photos",
    "picture",
    "pictures",
    "image",
    "images",
  ];

  const posterKeywords = [
    "poster",
    "banner",
    "flyer",
    "brochure",
    "advertisement",
    "notice",
    "leaflet",
  ];

  const certificateKeywords = [
    "certificate",
    "award",
    "license",
    "id card",
    "card",
  ];

  const formalKeywords = [
    "submission",
    "final",
    "official",
    "formal",
    "presentation",
  ];

  // 1. Academic documents
  if (containsAny(text, academicKeywords)) {
    suggestions.paperSize = "A4";
    suggestions.printType = "Black & White";
    suggestions.orientation = "Portrait";
    suggestions.notes = "Recommended for academic and document printing.";
  }

  // 2. Photos
  if (containsAny(text, photoKeywords)) {
    suggestions.printType = "Color";
    suggestions.sides = "Single-sided";
    suggestions.binding = "None";
    suggestions.notes = "Recommended for photo printing.";
  }

  // 3. Posters / flyers / brochures
  if (containsAny(text, posterKeywords)) {
    suggestions.paperSize = "A3";
    suggestions.printType = "Color";
    suggestions.sides = "Single-sided";
    suggestions.binding = "None";
    suggestions.notes = "Recommended for poster or promotional material printing.";
  }

  // 4. Certificates / cards
  if (containsAny(text, certificateKeywords)) {
    suggestions.paperSize = "A4";
    suggestions.printType = "Color";
    suggestions.sides = "Single-sided";
    suggestions.lamination = "Yes";
    suggestions.binding = "None";
    suggestions.notes = "Recommended for certificates and important display documents.";
  }

  // 5. Orientation
  if (text.includes("landscape")) {
    suggestions.orientation = "Landscape";
  }

  if (text.includes("portrait")) {
    suggestions.orientation = "Portrait";
  }

  // 6. Page count logic
  if (pageCount !== null) {
    if (pageCount >= 15) {
      suggestions.sides = "Double-sided";
      suggestions.notes = "Double-sided printing is recommended to save paper for larger documents.";
    }

    if (pageCount >= 40) {
      suggestions.binding = "Spiral Binding";
      suggestions.notes = "Large document detected. Spiral binding is recommended.";
    }
  }

  // 7. Formal / submission logic
  if (containsAny(text, formalKeywords)) {
    suggestions.binding = "Spiral Binding";
    suggestions.notes = "Recommended for formal submission and presentation documents.";
  }

  // 8. Copy count detection
  // Supports:
  // - 2 copies
  // - 3 copy
  const copyMatch = text.match(/(\d+)\s*cop(y|ies)/i);
  if (copyMatch) {
    const detectedCopies = Number(copyMatch[1]);
    if (Number.isInteger(detectedCopies) && detectedCopies > 0) {
      suggestions.copies = detectedCopies;
    }
  }

  // 9. Explicit color overrides
  if (text.includes("color") || text.includes("colour")) {
    suggestions.printType = "Color";
  }

  if (
    text.includes("black and white") ||
    text.includes("black & white") ||
    text.includes("bw") ||
    text.includes("b&w")
  ) {
    suggestions.printType = "Black & White";
  }

  // 10. Explicit side overrides
  if (text.includes("double sided") || text.includes("double-sided")) {
    suggestions.sides = "Double-sided";
  }

  if (text.includes("single sided") || text.includes("single-sided")) {
    suggestions.sides = "Single-sided";
  }

  // 11. Explicit binding overrides
  if (text.includes("spiral")) {
    suggestions.binding = "Spiral Binding";
  }

  if (text.includes("staple") || text.includes("stapled")) {
    suggestions.binding = "Stapled";
  }

  if (text.includes("no binding")) {
    suggestions.binding = "None";
  }

  // 12. Explicit lamination overrides
  if (text.includes("lamination") || text.includes("laminate")) {
    suggestions.lamination = "Yes";
  }

  if (text.includes("no lamination")) {
    suggestions.lamination = "No";
  }

  return sanitizeSuggestions(suggestions);
}

module.exports = {
  generatePrintSuggestions,
};