import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Story Protocol AI',
  description: 'AI-powered skills and plugins for Story Protocol development',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started/' },
      { text: 'Plugins', link: '/plugins/' },
      { text: 'Skills', link: '/skills/' },
    ],
    sidebar: [
      {
        text: 'Getting Started',
        items: [{ text: 'Overview', link: '/getting-started/' }],
      },
      {
        text: 'Plugins',
        items: [
          { text: 'Overview', link: '/plugins/' },
          { text: 'story-ip', link: '/plugins/story-ip' },
          { text: 'story-licensing', link: '/plugins/story-licensing' },
          { text: 'story-royalty', link: '/plugins/story-royalty' },
          { text: 'story-sdk', link: '/plugins/story-sdk' },
          { text: 'story-contracts', link: '/plugins/story-contracts' },
        ],
      },
      {
        text: 'Skills',
        items: [
          { text: 'Overview', link: '/skills/' },
          { text: 'ip-registration', link: '/skills/ip-registration' },
          { text: 'licensing', link: '/skills/licensing' },
          { text: 'royalty-integration', link: '/skills/royalty-integration' },
          { text: 'sdk-integration', link: '/skills/sdk-integration' },
          { text: 'smart-contracts', link: '/skills/smart-contracts' },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/storyprotocol/story-skills' },
    ],
    footer: {
      message: 'MIT License',
    },
    search: { provider: 'local' },
  },
  markdown: {
    languages: ['solidity', 'typescript', 'javascript', 'json', 'bash', 'yaml'],
  },
});
