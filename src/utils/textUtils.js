/**
 * Extract plain text from HTML content
 * Removes all HTML tags while preserving line breaks between paragraphs
 */
export const extractPlainText = (html) => {
  if (!html) return "";

  // Create a temporary DOM element to parse HTML
  const temp = document.createElement("div");
  temp.innerHTML = html;

  // Extract text while preserving paragraph breaks
  let text = "";
  const paragraphs = temp.querySelectorAll("p");
  
  if (paragraphs.length > 0) {
    // If there are paragraphs, extract text from each one
    text = Array.from(paragraphs)
      .map((p) => (p.textContent || p.innerText || "").trim())
      .filter((line) => line.length > 0) // Remove empty lines
      .join("\n");
  } else {
    // If no paragraphs, just get the text content
    text = (temp.textContent || temp.innerText || "").trim();
  }

  return text;
};

/**
 * Convert plain text to HTML with basic formatting preserved
 * Adds paragraph tags for better display
 */
export const plainTextToHtml = (text) => {
  if (!text) return "";

  return text
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (trimmed === "") return "<p><br></p>";
      return `<p>${trimmed}</p>`;
    })
    .join("");
};
