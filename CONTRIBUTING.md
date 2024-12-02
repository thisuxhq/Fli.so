# Contributing to fli.so

## Getting Started

Hey! Thanks for wanting to contribute to fli.so. Here's how to get started:

1. **Fork the repository** — it’s the first step in making your changes.
2. **Clone your fork**:
    ```bash
    git clone https://github.com/thisuxhq/Fli.so
    cd fli.so
    ```

3. **Install the dependencies**:
    ```bash
    bun install
    ```

4. **Start the development environment**:
    ```bash
    bun run start
    ```

## Development Guidelines

To keep things smooth and consistent, here are some simple guidelines to follow:

- Stick to the existing code style (Prettier and ESLint configs are already set up for you).
- Use TypeScript for any new code you write.
- Follow the Svelte 5 Runes conventions for state management.
- Use Shadcn UI components from `$lib/components/ui` — they’re already in place for you.
- Style with Tailwind CSS and match the project's color scheme.

## Pull Request Process

We’d love to see your contributions! Here’s how to submit them:

1. Create a new branch for your feature or fix.
2. Write clear and descriptive commit messages.
3. Update the documentation if needed — we want everyone to understand your changes.
4. Ensure all tests pass by running: `bun test`.
5. When you're ready, submit your PR against the `main` branch.

## Project Structure

- `/src/routes` - Where the SvelteKit routes live.
- `/src/lib` - Shared components and utilities.
- `/static` - Static assets like images and icons.
- `/src/lib/components/ui` - Shadcn UI components.

## Testing

To make sure everything works as expected, run the tests with:
```bash
bun test
```

## Need Help?

We’re here for you! Reach out if you need anything:

- Open an issue for bugs or feature requests.
- Join our [Discord community](https://discord.gg/SGkjHvhg) to chat with the team.
- Check out the [README.md](README.md) for more detailed info.

## License

By contributing, you agree to license your contributions under the AGPL-3.0 License. Thanks for being awesome!
