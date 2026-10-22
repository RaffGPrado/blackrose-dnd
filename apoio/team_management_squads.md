# Team Management Squads Operational Standards

These operational standards are defined by the Senior Developer for Agentic Coding on this project:

1. **Communication Protocol**: Reports must be strictly direct and concise. Zero formalities, roleplay, or sentimentality. Bullet points and raw technical status only.
2. **Squad Architecture**: Complex refactorings must be split into modular Multi-Agent Squads (e.g., 5-10 agents per feature).
3. **Roles per Module**: Squads must be segregated into specific roles: Implementer (writes code), Researcher (extracts domain knowledge), Compliance (audits against `apoio/` docs), Inspector (code QA/Race conditions), and Refactorer (DRY/Clean Code).
4. **Tool Restrictions**: Agents must use native tools (`view_file`, `replace_file_content`) and never bypass system constraints (e.g. no `git` commands).
5. **Git Commits**: All git commits MUST follow the Conventional Commits specification (e.g., `feat:`, `fix:`, `refactor:`, `chore:`).
