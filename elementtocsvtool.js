/**
 * Webpage Element Extractor
 * 
 * This script extracts important elements from a webpage and generates a CSV file.
 * It focuses on interactive elements and static text that would be useful for Selenium automation.
 * 
 * How to use:
 * 1. Open the webpage you want to analyze
 * 2. Open browser developer tools (F12 or right-click > Inspect)
 * 3. Copy and paste this entire script into the Console tab
 * 4. Press Enter to run the script
 * 5. A CSV file will be automatically downloaded
 */

function extractImportantElements() {
  // Initialize array to store elements data
  const elementsData = [];
  
  // Helper function to get a unique identifier for an element
  function getElementIdentifier(element) {
    if (element.id) {
      return { type: 'id', value: element.id };
    } else if (element.className && typeof element.className === 'string' && element.className.trim() !== '') {
      return { type: 'class', value: element.className.trim() };
    } else {
      // No valid identifier available
      return { type: 'none', value: 'no-id-or-class' };
    }
  }

  // Extract text content from an element, handling special cases
  function getElementText(element) {
    // For inputs, get placeholder or value
    if (element.tagName === 'INPUT') {
      if (element.type === 'button' || element.type === 'submit') {
        return element.value || element.placeholder || '[' + element.type + ' button]';
      } else if (element.type === 'checkbox' || element.type === 'radio') {
        const label = document.querySelector(`label[for="${element.id}"]`);
        return label ? label.textContent.trim() : '[' + element.type + ']';
      } else {
        return element.placeholder || '[' + element.type + ' input]';
      }
    } 
    // For select elements, capture the label or options
    else if (element.tagName === 'SELECT') {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) {
        return label.textContent.trim();
      } else {
        let options = Array.from(element.options).map(opt => opt.textContent.trim()).join(', ');
        return options.length > 100 ? options.substring(0, 100) + '...' : options;
      }
    } 
    // For buttons, get text or value
    else if (element.tagName === 'BUTTON') {
      return element.textContent.trim() || '[button]';
    }
    // For links, get text
    else if (element.tagName === 'A') {
      return element.textContent.trim() || '[link]';
    }
    // For standard elements, get text content
    else {
      const text = element.textContent.trim();
      // Truncate very long text
      return text.length > 100 ? text.substring(0, 100) + '...' : text;
    }
  }

  // Capture buttons
  const buttons = [...document.querySelectorAll('button, input[type="button"], input[type="submit"]')];
  buttons.forEach(button => {
    const identifier = getElementIdentifier(button);
    const text = getElementText(button);
    if (text) {
      elementsData.push({
        element_type: button.tagName.toLowerCase() + (button.type ? `[type="${button.type}"]` : ''),
        text_content: text,
        selector_type: identifier.type,
        selector_value: identifier.value
      });
    }
  });

  // Capture form inputs
  const inputs = [...document.querySelectorAll('input[type="text"], input[type="password"], input[type="email"], input[type="number"], input[type="search"], input[type="tel"], input[type="url"], textarea')];
  inputs.forEach(input => {
    const identifier = getElementIdentifier(input);
    const label = document.querySelector(`label[for="${input.id}"]`);
    const text = label ? label.textContent.trim() : getElementText(input);
    if (text) {
      elementsData.push({
        element_type: input.tagName.toLowerCase() + (input.type ? `[type="${input.type}"]` : ''),
        text_content: text,
        selector_type: identifier.type,
        selector_value: identifier.value
      });
    }
  });

  // Capture checkboxes and radio buttons
  const checkboxesAndRadios = [...document.querySelectorAll('input[type="checkbox"], input[type="radio"]')];
  checkboxesAndRadios.forEach(input => {
    const identifier = getElementIdentifier(input);
    const label = document.querySelector(`label[for="${input.id}"]`);
    const text = label ? label.textContent.trim() : getElementText(input);
    if (text) {
      elementsData.push({
        element_type: input.tagName.toLowerCase() + `[type="${input.type}"]`,
        text_content: text,
        selector_type: identifier.type,
        selector_value: identifier.value
      });
    }
  });

  // Capture select dropdowns
  const selects = [...document.querySelectorAll('select')];
  selects.forEach(select => {
    const identifier = getElementIdentifier(select);
    const text = getElementText(select);
    if (text) {
      elementsData.push({
        element_type: 'select',
        text_content: text,
        selector_type: identifier.type,
        selector_value: identifier.value
      });
    }
  });

  // Capture links
  const links = [...document.querySelectorAll('a')];
  links.forEach(link => {
    const identifier = getElementIdentifier(link);
    const text = getElementText(link);
    if (text && text !== '[link]') {
      elementsData.push({
        element_type: 'a',
        text_content: text,
        selector_type: identifier.type,
        selector_value: identifier.value
      });
    }
  });

  // Capture headings
  const headings = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')];
  headings.forEach(heading => {
    const identifier = getElementIdentifier(heading);
    const text = heading.textContent.trim();
    if (text) {
      elementsData.push({
        element_type: heading.tagName.toLowerCase(),
        text_content: text,
        selector_type: identifier.type,
        selector_value: identifier.value
      });
    }
  });

  // Capture static text in paragraphs and spans
  const staticTexts = [...document.querySelectorAll('p, span, div, label')];
  staticTexts.forEach(element => {
    // Skip elements that are just containers with no direct text
    const hasDirectText = Array.from(element.childNodes)
      .some(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '');
    
    if (hasDirectText) {
      const identifier = getElementIdentifier(element);
      const text = element.textContent.trim();
      
      // Skip empty text or very long text (likely a container)
      if (text && text.length > 0 && text.length < 200) {
        // Skip if this element contains other important elements we've already captured
        const containsImportantElements = element.querySelectorAll('button, input, select, a, h1, h2, h3, h4, h5, h6').length > 0;
        
        if (!containsImportantElements) {
          elementsData.push({
            element_type: element.tagName.toLowerCase(),
            text_content: text,
            selector_type: identifier.type,
            selector_value: identifier.value
          });
        }
      }
    }
  });

  // Capture table headers
  const tableHeaders = [...document.querySelectorAll('th')];
  tableHeaders.forEach(th => {
    const identifier = getElementIdentifier(th);
    const text = th.textContent.trim();
    if (text) {
      elementsData.push({
        element_type: 'th',
        text_content: text,
        selector_type: identifier.type,
        selector_value: identifier.value
      });
    }
  });

  // Filter out elements with no valid identifier
  const validElementsData = elementsData.filter(item => item.selector_type !== 'none');
  
  // Convert data to CSV
  let csv = 'Element Type,Text Content,Selector Type,Selector Value\n';
  validElementsData.forEach(item => {
    // Escape commas and quotes in fields
    const elementType = `"${item.element_type.replace(/"/g, '""')}"`;
    const textContent = `"${item.text_content.replace(/"/g, '""')}"`;
    const selectorType = `"${item.selector_type.replace(/"/g, '""')}"`;
    const selectorValue = `"${item.selector_value.replace(/"/g, '""')}"`;
    
    csv += `${elementType},${textContent},${selectorType},${selectorValue}\n`;
  });

  // Download CSV file
  const pageTitle = document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'webpage';
  const filename = `${pageTitle}_elements_${new Date().toISOString().slice(0, 10)}.csv`;
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  console.log(`Extracted ${validElementsData.length} elements with ID or class and downloaded as ${filename}`);
  console.log(`(Skipped ${elementsData.length - validElementsData.length} elements that had no ID or class)`);

  return elementsData;
}

// Run the extraction function
const extractedElements = extractImportantElements();
