const { cpSync, existsSync, mkdirSync } = require('fs');
const { dirname, join } = require('path');

const widgetEntry = require.resolve('@sippet-ai/widget');
const source = dirname(widgetEntry);
const destination = join(__dirname, '..', 'public', 'sippet-widget');

if (!existsSync(source)) {
  throw new Error(`Sippet widget assets were not found at ${source}`);
}

mkdirSync(destination, { recursive: true });
cpSync(source, destination, { recursive: true, force: true });

console.log(`Synced Sippet widget assets to ${destination}`);
