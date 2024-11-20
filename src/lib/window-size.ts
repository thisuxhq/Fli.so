import { writable } from 'svelte/store';

class WindowSize {
	private size = writable({ width: 0, height: 0 });

	constructor() {
		// Initialize the store with the current window size
		if (typeof window !== 'undefined') {
			this.updateSize();
		}

		// Add event listener for window resize
		if (typeof window !== 'undefined') {
			window.addEventListener('resize', this.updateSize.bind(this));
		}
	}

	// Method to get the current window size
	getSize() {
		return this.size;
	}

	// Method to update the window size
	private updateSize() {
		this.size.set({ width: window.innerWidth, height: window.innerHeight });
	}

	// Cleanup method to remove the event listener
	destroy() {
		if (typeof window !== 'undefined') {
			window.removeEventListener('resize', this.updateSize.bind(this));
		}
	}
}

// Create an instance of the WindowSize class
export const windowSize = new WindowSize();
