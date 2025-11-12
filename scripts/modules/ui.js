/**
 * UI module
 * Handles toast notifications for user feedback
 */

/**
 * Toast notification handler
 */
export class Toast {
    constructor(element) {
        this.element = element;
        this.timeout = null;
        this.element.setAttribute('aria-hidden', 'true');
    }

    /**
     * Show toast message
     * @param {string} message - Message to display
     * @param {object} options - Display options
     * @param {'info' | 'error'} options.type - Toast type (default: 'info')
     * @param {number|null} options.duration - Duration in milliseconds, set null to keep visible
     */
    show(message, { type = 'info', duration = null } = {}) {
        this.element.textContent = message;
        this.element.setAttribute('data-type', type);
        this.element.classList.add('toast--visible');
        this.element.setAttribute('aria-hidden', 'false');

        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }

        if (duration !== null) {
            this.timeout = setTimeout(() => {
                this.hide();
            }, duration);
        }
    }

    /**
     * Hide toast message
     */
    hide() {
        this.element.classList.remove('toast--visible');
        this.element.setAttribute('aria-hidden', 'true');

        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }
}
