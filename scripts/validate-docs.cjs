#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

let errors = 0;

function error(msg) {
  console.error(`ERROR: ${msg}`);
  errors++;
}

// Skill packages to validate
const skillPackages = ['story-sdk', 'story-contracts'];

for (const pkg of skillPackages) {
  if (!fs.existsSync(pkg)) {
    error(`Skill package directory not found: ${pkg}`);
    continue;
  }

  // Check package docs page
  const pkgDoc = path.join('docs', 'plugins', `${pkg}.md`);
  if (!fs.existsSync(pkgDoc)) {
    error(`Missing docs page for package "${pkg}": ${pkgDoc}`);
  }

  // Check sub-skill docs pages
  const entries = fs.readdirSync(pkg, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === 'references' || entry.name === 'node_modules') continue;
    const subSkillMd = path.join(pkg, entry.name, 'SKILL.md');
    if (fs.existsSync(subSkillMd)) {
      const skillDoc = path.join('docs', 'skills', `${entry.name}.md`);
      if (!fs.existsSync(skillDoc)) {
        error(`Missing docs page for skill "${entry.name}": ${skillDoc}`);
      }
    }
  }
}

console.log(`\nDocs validation complete: ${errors} error(s)`);
process.exit(errors > 0 ? 1 : 0);
