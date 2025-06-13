// Web scraping text extraction script
// Extracts clean text content from articles on various websites

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

// Function to extract clean text from article
function extractArticleText() {
  console.log('Text Extractor: Current URL:', window.location.href);

  // Find the article content using multiple strategies
  let article = null;
  let articleText = '';

  for (const selector of articleSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      article = element;
      console.log('Text Extractor: Found article using selector:', selector);
      break;
    }
  }

  // Fallback: if no article found, try to find content by looking for paragraphs
  if (!article) {
    const contentContainer = document.querySelector('body');
    const paragraphs = contentContainer?.querySelectorAll('p');
    
    if (paragraphs && paragraphs.length > 3) {
      article = contentContainer;
      console.log('Text Extractor: Using fallback - found', paragraphs.length, 'paragraphs');
    }
  }

  if (!article) {
    console.log('Text Extractor: No article content found');
    return null;
  }

  // Extract text content from the article
  let textContent = '';
  
  // First try: get all paragraphs within the article
  const paragraphsInArticle = article.querySelectorAll('p');
  if (paragraphsInArticle.length > 0) {
    textContent = Array.from(paragraphsInArticle).map(p => p.textContent).join('\n\n');
    console.log('Text Extractor: Found', paragraphsInArticle.length, 'paragraphs in article');
  }
  
  // Fallback: use the full article content
  if (!textContent.trim()) {
    textContent = article.textContent;
    console.log('Text Extractor: Using full article textContent as fallback');
  }
  
  // Extra fallback for specific content containers
  if (!textContent.trim()) {
    const contentSelectors = [
      '.detail-text p',
      '.article-content p', 
      '.content-detail p',
      '.detail-content p',
      'article p',
      'main p'
    ];
    
    for (const selector of contentSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        textContent = Array.from(elements).map(p => p.textContent).join('\n\n');
        console.log('Text Extractor: Found content using selector:', selector, 'with', elements.length, 'paragraphs');
        break;
      }
    }
  }
  
  // Clean up the text by removing excessive whitespace and non-content elements
  const cleanText = textContent
    .replace(/\s+/g, ' ')              // Replace multiple whitespace with single space
    .replace(/^\s+|\s+$/g, '')         // Trim leading/trailing whitespace
    .replace(/\n{3,}/g, '\n\n')        // Limit excessive line breaks
    .replace(/\t/g, ' ')               // Replace tabs with spaces
    .replace(/\r/g, '');               // Remove carriage returns

  console.log('Text Extractor: Extracted text length:', cleanText.length);
  console.log('Text Extractor: First 200 chars:', cleanText.substring(0, 200));
  
  return cleanText;
}

// Function to extract article metadata
function extractArticleMetadata() {
  const metadata = {
    title: '',
    url: window.location.href,
    timestamp: null,
    author: ''
  };

  // Extract title
  const titleSelectors = [
    '.detail-title h1',
    '.article-title h1', 
    '.news-title h1',
    '.headline__text',
    'h1[data-component-name="Headline"]',
    'h1'
  ];

  for (const selector of titleSelectors) {
    const titleElement = document.querySelector(selector);
    if (titleElement) {
      metadata.title = titleElement.textContent.trim();
      break;
    }
  }

  // Extract author
  const authorSelectors = [
    '.detail-author',
    '.article-author', 
    '.news-author',
    '.author',
    '.byline',
    '[data-component-name="Byline"]'
  ];

  for (const selector of authorSelectors) {
    const authorElement = document.querySelector(selector);
    if (authorElement) {
      metadata.author = authorElement.textContent.trim();
      break;
    }
  }

  // Extract timestamp
  const timeElement = document.querySelector('time');
  if (timeElement) {
    metadata.timestamp = timeElement.getAttribute('datetime') || timeElement.textContent.trim();
  }

  return metadata;
}

// Main extraction function
function scrapeArticle() {
  const text = extractArticleText();
  const metadata = extractArticleMetadata();
  
  if (!text || text.length < 100) {
    console.log('Text Extractor: No substantial content found');
    return null;
  }

  const result = {
    ...metadata,
    content: text,
    wordCount: text.split(/\s+/).length,
    extractedAt: new Date().toISOString()
  };

  console.log('Text Extractor: Successfully extracted article:', result);
  return result;
}

// Auto-extract when script loads
const extractedData = scrapeArticle();

// Make extraction functions available globally for manual use
window.extractArticleText = extractArticleText;
window.extractArticleMetadata = extractArticleMetadata;
window.scrapeArticle = scrapeArticle;

// Output the result (for use in browser console or further processing)
if (extractedData) {
  console.log('=== EXTRACTED ARTICLE DATA ===');
  console.log('Title:', extractedData.title);
  console.log('Author:', extractedData.author);
  console.log('URL:', extractedData.url);
  console.log('Word Count:', extractedData.wordCount);
  console.log('Content Preview:', extractedData.content.substring(0, 500) + '...');
  console.log('Full Data Object:', extractedData);
}

// extractArticleText is already available globally via window object