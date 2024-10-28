# Blink - URL Shortener

Blink is a URL shortener built with SvelteKit and PocketBase. It provides a clean and simple interface for shortening long URLs into short, memorable links.

## Features

- **URL Shortening:** Shorten long URLs using a custom or automatically generated slug.
- **Customizable Slugs:** Create your own short URLs.
- **Click Tracking:** Track the number of clicks on each shortened URL.
- **Clean UI:** Modern and user-friendly interface.
- **Dark Mode:** Toggle between light and dark themes.
- **Keyboard Shortcuts:** Efficient navigation and actions using keyboard shortcuts. (See the help dialog for details).

## Tech Stack

- **Frontend:** SvelteKit
- **Backend:** PocketBase (self-hosted)
- **Styling:** Tailwind CSS
- **State Management:** SvelteKit's Runes API for reactivity
- **Package Manager:** Bun

## Setup

1. **Clone the repository:**

   ```bash
   git clone <repository_url>
   ```

2. **Install dependencies:**

   ```bash
   bun install
   ```

3. **Start PocketBase (if not already running):** This project uses a self-hosted PocketBase instance. You can start it using:

   ```bash
   npm run pocketbase:dev  # or the equivalent Bun command if available.  Check your package.json. Or you can skip this step and check the step 5.
   ```

   (This command starts PocketBase in development mode on `http://localhost:8090`. Adjust the port if necessary.)

4. **Generate PocketBase types:**

   ```bash
   bun run typegen
   ```

   This will generate the types for the PocketBase collections and save them in the `types` folder.

5. **Run the development server:**

   ```bash
   bun run start # this will start the SvelteKit app and the PocketBase server on different ports together.
   ```

6. **Visit:** `http://localhost:5173`
7. **For admin access to PocketBase, visit:** `http://localhost:8090/_/`
   1. Create an admin user.
   2. Now you will be able to see tables already created in the `collections` folder.
   3. You can also create new collections from the UI.

## Deployment

Deployment instructions will be added later.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License and Copyright

Copyright 2024 THISUX PRIVATE LIMITED

Licensed under the Affero General Public License (AGPL-3.0)
