---
title: Useful Code Snippets Collection
date: 2024-03-15
excerpt: A collection of handy code snippets I use regularly in my projects.
tags: code snippets, javascript, css, tools
---

Here are some useful code snippets that I find myself using frequently in various projects. Feel free to use and adapt them for your own needs.

## JavaScript

### Debounce Function

```javascript
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
```

### Format Date

```javascript
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
```

## CSS

### Center Content

```css
.center {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
```

### Responsive Typography

```css
html {
  font-size: 16px;
}

@media (min-width: 768px) {
  html {
    font-size: 18px;
  }
}

@media (min-width: 1024px) {
  html {
    font-size: 20px;
  }
}
```

## Node.js

### Read JSON File

```javascript
const fs = require('fs');

function readJSON(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading JSON:', error);
    return null;
  }
}
```

## Shell

### Find and Replace in Files

```bash
find . -type f -name "*.js" -exec sed -i '' 's/oldText/newText/g' {} +
```

### Count Lines of Code

```bash
find . -name "*.js" | xargs wc -l
```

## Tips

- Keep snippets organized in a dedicated file or tool
- Add comments explaining when and why to use each snippet
- Regularly review and update your collection
- Share useful snippets with your team

## Conclusion

Having a collection of useful code snippets can save you time and help maintain consistency across projects. What are your favorite code snippets?
