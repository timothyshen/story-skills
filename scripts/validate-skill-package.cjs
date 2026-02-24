#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const packageDir = process.argv[2];
const requireEvals = process.argv.includes('--require-evals');

if (!packageDir) {
  console.error('Usage: node scripts/validate-skill-package.cjs <package-dir> [--require-evals]');
  process.exit(1);
}

const abs = (rel) => path.join(packageDir, rel);
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

// Required: root SKILL.md
const rootSkill = abs('SKILL.md');
if (!fs.existsSync(rootSkill)) {
  error('Missing required file: SKILL.md');
} else {
  const content = fs.readFileSync(rootSkill, 'utf8');
  if (!content.startsWith('---')) {
    error('SKILL.md missing frontmatter');
  } else {
    const frontmatter = content.split('---')[1];
    for (const field of ['name:', 'description:']) {
      if (!frontmatter.includes(field)) {
        error(`SKILL.md missing frontmatter field: ${field}`);
      }
    }
  }
}

// Find all sub-skill SKILL.md files
const entries = fs.readdirSync(packageDir, { withFileTypes: true });
for (const entry of entries) {
  if (!entry.isDirectory()) continue;
  if (entry.name === 'references' || entry.name === 'node_modules') continue;

  const subSkillMd = path.join(packageDir, entry.name, 'SKILL.md');
  if (fs.existsSync(subSkillMd)) {
    const content = fs.readFileSync(subSkillMd, 'utf8');
    if (!content.startsWith('---')) {
      error(`Sub-skill SKILL.md missing frontmatter: ${subSkillMd}`);
    } else {
      const frontmatter = content.split('---')[1];
      for (const field of ['name:', 'description:', 'model:']) {
        if (!frontmatter.includes(field)) {
          error(`Sub-skill SKILL.md missing frontmatter field ${field}: ${subSkillMd}`);
        }
      }
    }

    // Check for eval suite
    const skillName = entry.name;
    const evalSuite = path.join('evals', 'suites', skillName, 'promptfoo.yaml');
    if (!fs.existsSync(evalSuite)) {
      const msg = `No eval suite found for skill "${skillName}" at ${evalSuite}`;
      if (requireEvals) {
        error(msg);
      } else {
        warn(msg);
      }
    }
  }
}

// Check package.json exists
if (!fs.existsSync(abs('package.json'))) {
  warn('Missing package.json');
}

console.log(`\nValidation complete: ${errors} error(s), ${warnings} warning(s)`);
process.exit(errors > 0 ? 1 : 0);
