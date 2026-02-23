#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const pluginDir = process.argv[2];
const requireEvals = process.argv.includes('--require-evals');

if (!pluginDir) {
  console.error('Usage: node scripts/validate-plugin.cjs <plugin-dir> [--require-evals]');
  process.exit(1);
}

const abs = (rel) => path.join(pluginDir, rel);
let errors = 0;
let warnings = 0;

function error(msg) {
  console.error(`ERROR: ${msg}`);
  errors++;
}

function warn(msg) {
  console.warn(`WARNING: ${msg}`);
  warnings++;
}

function info(msg) {
  console.log(`INFO: ${msg}`);
}

// Required files
const requiredFiles = [
  '.claude-plugin/plugin.json',
  'package.json',
  'project.json',
  'README.md',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(abs(file))) {
    error(`Missing required file: ${file}`);
  }
}

// Validate plugin.json
const pluginJsonPath = abs('.claude-plugin/plugin.json');
if (fs.existsSync(pluginJsonPath)) {
  const pluginJson = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf8'));
  const requiredFields = ['name', 'version', 'description'];
  for (const field of requiredFields) {
    if (!pluginJson[field]) {
      error(`plugin.json missing required field: ${field}`);
    }
  }

  // Validate skills exist
  if (pluginJson.skills && Array.isArray(pluginJson.skills)) {
    for (const skillPath of pluginJson.skills) {
      const skillDir = path.join(pluginDir, skillPath);
      const skillMd = path.join(skillDir, 'SKILL.md');
      if (!fs.existsSync(skillMd)) {
        error(`Skill SKILL.md not found: ${skillMd}`);
      } else {
        // Validate SKILL.md frontmatter
        const content = fs.readFileSync(skillMd, 'utf8');
        if (!content.startsWith('---')) {
          error(`SKILL.md missing frontmatter: ${skillMd}`);
        } else {
          const frontmatter = content.split('---')[1];
          const requiredFrontmatter = ['name:', 'description:', 'model:'];
          for (const field of requiredFrontmatter) {
            if (!frontmatter.includes(field)) {
              error(`SKILL.md missing frontmatter field ${field}: ${skillMd}`);
            }
          }
        }
      }

      // Check for eval suite
      const skillName = path.basename(skillPath);
      const evalSuite = path.join('evals', 'suites', skillName, 'promptfoo.yaml');
      if (!fs.existsSync(evalSuite)) {
        const msg = `No eval suite found for skill "${skillName}" at ${evalSuite}`;
        if (requireEvals) {
          error(msg);
        } else {
          warn(msg);
        }
        info(`To create: cp -r evals/templates/suite/ evals/suites/${skillName}/`);
      }
    }
  }

  // Validate agents exist (if specified)
  if (pluginJson.agents && Array.isArray(pluginJson.agents)) {
    for (const agentPath of pluginJson.agents) {
      const agentFile = path.join(pluginDir, agentPath);
      if (!fs.existsSync(agentFile)) {
        error(`Agent file not found: ${agentFile}`);
      }
    }
  }
}

// Validate project.json tags
const projectJsonPath = abs('project.json');
if (fs.existsSync(projectJsonPath)) {
  const projectJson = JSON.parse(fs.readFileSync(projectJsonPath, 'utf8'));
  if (!projectJson.tags || !projectJson.tags.includes('type:plugin')) {
    warn('project.json missing "type:plugin" tag');
  }
}

// Summary
console.log(`\nValidation complete: ${errors} error(s), ${warnings} warning(s)`);
process.exit(errors > 0 ? 1 : 0);
