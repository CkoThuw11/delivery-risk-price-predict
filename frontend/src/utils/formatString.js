export const snakeToTitle = str =>
  str.replace(/_/g, ' ')
     .replace(/\b\w/g, c => c.toUpperCase());
