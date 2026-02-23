#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

let errors = 0;

function error(msg) {
  console.error(`ERROR: ${msg}`);
  errors++;
}

// Find all plugins
const pluginsDir = path.join('packages', 'plugins');
if (!fs.existsSync(pluginsDir)) {
  console.log('No plugins directory found, skipping docs validation');
  process.exit(0);
}

const plugins = fs.readdirSync(pluginsDir).filter((d) => {
  return fs.statSync(path.join(pluginsDir, d)).isDirectory();
});

for (const plugin of plugins) {
  // Check plugin docs page
  const pluginDoc = path.join('docs', 'plugins', `${plugin}.md`);
  if (!fs.existsSync(pluginDoc)) {
    error(`Missing docs page for plugin "${plugin}": ${pluginDoc}`);
  }

  // Check skill docs pages
  const pluginJsonPath = path.join(pluginsDir, plugin, '.claude-plugin', 'plugin.json');
  if (fs.existsSync(pluginJsonPath)) {
    const pluginJson = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf8'));
    if (pluginJson.skills) {
      for (const skillPath of pluginJson.skills) {
        const skillName = path.basename(skillPath);
        const skillDoc = path.join('docs', 'skills', `${skillName}.md`);
        if (!fs.existsSync(skillDoc)) {
          error(`Missing docs page for skill "${skillName}": ${skillDoc}`);
        }
      }
    }
  }
}

console.log(`\nDocs validation complete: ${errors} error(s)`);
process.exit(errors > 0 ? 1 : 0);
