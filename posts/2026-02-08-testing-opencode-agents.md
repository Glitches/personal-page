---
title: Testing OpenCode Agents with Devstral 2 and Superpowers
date: 2026-02-08
tags: ai, agents, opencode, devstral
excerpt: My experience testing OpenCode agents and the challenges I've encountered with autonomous debugging.
draft: false
---

I've been testing OpenCode with Devstral 2 and the Superpowers framework, and I've noticed that while I can get an agent to work fairly autonomously, there are some challenges when direct feedback isn't available to pass to the agent. This makes certain problems difficult to debug.

## The RSS Reader Challenge

One specific example I've encountered is implementing smooth scrolling in a small CLI tool. I wanted to achieve dynamic line-by-line scrolling, but the best I've managed so far is jerky, inconsistent scrolling. The program is an RSS reader that lists feeds grouped by source.

The agents are becoming increasingly capable, but fine-grained control over certain UI elements in terminal applications remains challenging. The scrolling behavior I want would provide a much better user experience when browsing through long lists of RSS feed items.

## Autonomous Debugging Limitations

Without the ability to provide direct feedback about the scrolling behavior, the agent struggles to:

1. Understand the exact nature of the "jerky" scrolling issue
2. Determine what constitutes "smooth" scrolling in a terminal environment
3. Iterate on solutions without human guidance
4. Test different approaches systematically

## Current Implementation

The current implementation shows feeds in a basic list format:

```
Source 1:
- Article 1 title
- Article 2 title  
- Article 3 title

Source 2:
- Article 1 title
- Article 2 title
```

When there are many articles, the scrolling becomes problematic as the terminal tries to handle the output.

## Potential Solutions

I'm considering several approaches to improve this:

1. **Pagination**: Show a fixed number of items per "page" with next/previous navigation
2. **Terminal UI Library**: Use a library like `blessed` or `ink` for better terminal control
3. **Custom Scrolling Logic**: Implement manual scroll position tracking
4. **Performance Optimization**: Reduce the rendering overhead that causes jerkiness

## The Future of AI Agents

Despite these challenges, I'm impressed with how capable these agents are becoming. They can handle complex tasks, understand context, and even make autonomous decisions about implementation approaches. The scrolling issue is just one example where human feedback could bridge the gap between "good enough" and "polished."

As these systems continue to evolve, I expect we'll see improvements in:

- Understanding subtle UI/UX requirements
- Handling real-time interactive elements
- Providing more granular control over output formatting
- Better debugging capabilities for terminal applications

The agents are getting better every day, and while there are still some rough edges to smooth out, the progress is remarkable. I'm excited to see what the next generation of these tools will be capable of.

*DISCLAIMER*: I've let AI write down this post
