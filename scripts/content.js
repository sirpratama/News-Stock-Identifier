// Try multiple selectors for different website structures
const articleSelectors = [
  'article',                           // Standard article tag
  '[data-component-name="ArticleBody"]', // CNN article body
  '.detail-text',                      // CNN Indonesia article content
  '.detail-content',                   // CNN Indonesia content container  
  '.article-content',                  // CNN Indonesia article content
  '.content-detail',                   // CNN Indonesia content detail
  '.detail-wrap',                      // CNN Indonesia detail wrapper
  '.news-content',                     // CNN Indonesia news content
  '.zn-body__paragraph',               // CNN article content container
  '.l-container',                      // CNN article container
  'div[class*="article"]',             // Generic article divs
  '.entry-content',                    // WordPress/blog articles
  '.post-content',                     // Blog post content
  'main',                              // Main content area
];

// Debug: Log current URL to help with troubleshooting
console.log('Reading Time Extension: Current URL:', window.location.href);

// Find the article content using multiple strategies
let article = null;
let articleText = '';

for (const selector of articleSelectors) {
  const element = document.querySelector(selector);
  if (element) {
    article = element;
    console.log('Reading Time Extension: Found article using selector:', selector);
    break;
  }
}

// Fallback: if no article found, try to find content by looking for paragraphs
if (!article) {
  const contentContainer = document.querySelector('body');
  const paragraphs = contentContainer?.querySelectorAll('p');
  
  if (paragraphs && paragraphs.length > 3) { // If there are more than 3 paragraphs, we can use the body as the article
    // Create a virtual article from paragraphs
    article = contentContainer;
    console.log('Reading Time Extension: Using fallback - found', paragraphs.length, 'paragraphs');
  }
}

// `document.querySelector` may return null if the selector doesn't match anything.
if (article) {
  // For CNN Indonesia, let's try to get text from paragraphs specifically
  let textContent = '';
  
  // First try: get all paragraphs within the article
  const paragraphsInArticle = article.querySelectorAll('p');
  if (paragraphsInArticle.length > 0) { // If there are more than 0 paragraphs, we can use the paragraphs in the article
    textContent = Array.from(paragraphsInArticle).map(p => p.textContent).join(' ');
    console.log('Reading Time Extension: Found', paragraphsInArticle.length, 'paragraphs in article');
  }
  
  // Fallback: use the full article content
  if (!textContent.trim()) {
    textContent = article.textContent;
    console.log('Reading Time Extension: Using full article textContent as fallback');
  }
  
  // Extra fallback for CNN Indonesia: look for specific content containers
  if (!textContent.trim()) {
    const contentSelectors = [
      '.detail-text p',
      '.article-content p', 
      '.content-detail p',
      '.detail-content p',
      'article p',
      'main p'
    ];
    
    for (const selector of contentSelectors) { // For each selector, we can get the paragraphs in the article
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        textContent = Array.from(elements).map(p => p.textContent).join(' ');
        console.log('Reading Time Extension: Found content using selector:', selector, 'with', elements.length, 'paragraphs');
        break;
      }
    }
  }
  
  console.log('Reading Time Extension: Text content length:', textContent.length);
  console.log('Reading Time Extension: First 200 chars:', textContent.substring(0, 200));
  
  // Clean up the text by removing excessive whitespace and non-content elements
  const cleanText = textContent
    .replace(/\s+/g, ' ')              // Replace multiple whitespace with single space
    .replace(/^\s+|\s+$/g, '')         // Trim leading/trailing whitespace
    .replace(/\n{3,}/g, '\n\n');       // Limit excessive line breaks

  const wordMatchRegExp = /[^\s]+/g; // Regular expression
  const words = cleanText.matchAll(wordMatchRegExp);
  // matchAll returns an iterator, convert to array to get word count
  const wordCount = [...words].length;
  
  console.log('Reading Time Extension: Word count:', wordCount);
  
  // Only proceed if we have a reasonable word count (avoid navigation/footer text)
  if (wordCount > 50) {
    const readingTime = Math.round(wordCount / 200);
    const badge = document.createElement("p");
    // Use the same styling as the publish information in an article's header
    badge.classList.add("color-secondary-text", "type--caption");
    badge.textContent = `⏱️ ${readingTime} min read`;
    badge.style.cssText = `
      margin: 8px 0;
      color: #666;
      font-size: 14px;
      font-weight: normal;
      font-family: inherit;
      background: #f0f0f0;
      padding: 4px 8px;
      border-radius: 4px;
      display: inline-block;
    `;

    // Enhanced placement logic for different sites
    let targetElement = null;
    
    // CNN Indonesia specific selectors (more comprehensive)
    const cnnIdHeadline = document.querySelector('.detail-title h1, .article-title h1, .news-title h1, h1');
    const cnnIdByline = document.querySelector('.detail-author, .article-author, .news-author, .author');
    const cnnIdTimestamp = document.querySelector('.detail-date, .article-date, .news-date, .date-time, time');
    
    // CNN-specific selectors
    const cnnHeadline = document.querySelector('.headline__text, h1[data-component-name="Headline"]');
    const cnnByline = document.querySelector('.byline, [data-component-name="Byline"]');
    const cnnTimestamp = document.querySelector('.timestamp, time');
    
    // Support for API reference docs (original)
    const heading = article.querySelector("h1") || document.querySelector("h1");
    
    // Support for article docs with date (original)
    const date = document.querySelector("time")?.parentNode;
    
    // Determine the best place to insert the reading time
    if (cnnIdByline) {
      targetElement = cnnIdByline;
      console.log('Reading Time Extension: Placing after CNN Indonesia byline');
    } else if (cnnIdTimestamp) {
      targetElement = cnnIdTimestamp;
      console.log('Reading Time Extension: Placing after CNN Indonesia timestamp');
    } else if (cnnIdHeadline) {
      targetElement = cnnIdHeadline;
      console.log('Reading Time Extension: Placing after CNN Indonesia headline');
    } else if (cnnByline) {
      targetElement = cnnByline;
      console.log('Reading Time Extension: Placing after CNN byline');
    } else if (cnnTimestamp) {
      targetElement = cnnTimestamp;
      console.log('Reading Time Extension: Placing after CNN timestamp');
    } else if (cnnHeadline) {
      targetElement = cnnHeadline;
      console.log('Reading Time Extension: Placing after CNN headline');
    } else if (date) {
      targetElement = date;
      console.log('Reading Time Extension: Placing after date');
    } else if (heading) {
      targetElement = heading;
      console.log('Reading Time Extension: Placing after heading');
    }
    
    // Insert the badge after the target element, or at the beginning of article if no target found
    if (targetElement) {
      targetElement.insertAdjacentElement("afterend", badge);
      console.log('Reading Time Extension: Reading time badge added successfully!');
    } else {
      // Fallback: insert at the beginning of the article
      article.insertAdjacentElement("afterbegin", badge);
      console.log('Reading Time Extension: Reading time badge added at article beginning (fallback)');
    }
  } else {
    console.log('Reading Time Extension: Word count too low, skipping');
  }
} else {
  console.log('Reading Time Extension: No article content found');
}