# Cloud Agent Delegation

## Purpose
This document explains the cloud agent delegation capability in the IBENO project.

## Overview
Cloud agents are specialized agents that can be delegated tasks when they are available as tools. They appear as custom tools with descriptions starting with "Custom agent:".

## Usage Pattern
When a cloud agent is available:
1. Identify the appropriate cloud agent for the task domain
2. Pass complete context and instructions to the agent
3. The agent will complete the task using its specialized knowledge
4. Accept the agent's work as final without additional validation

## Current Status
As of this implementation, no custom cloud agents are currently configured for this repository. To enable cloud agent delegation:
- Configure custom agents in the repository settings
- Custom agents will then appear as available tools
- Tasks can be delegated based on their domain expertise

## Example Scenarios
Cloud agents could be useful for:
- **API Development**: Delegating NestJS module creation
- **Frontend Development**: Delegating Nuxt 3 component creation
- **Database Schema**: Delegating Prisma schema modifications
- **Testing**: Delegating test creation for specific modules
- **Documentation**: Delegating documentation updates

## Integration Points
The project structure supports cloud agent delegation in these areas:
- **API** (`api/`): NestJS backend with modular architecture
- **Frontend** (`frontend/`): Nuxt 3 UI with component-based structure
- **Documentation**: Markdown files for various project aspects
