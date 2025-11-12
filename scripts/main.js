/**
 * Main application entry point
 * Initializes all modules and coordinates application startup
 */

// Import validation module to register window.validateNameInput
import './utils/validation.js';

import { initializeSlots } from './modules/display.js';
import { Toast } from './modules/ui.js';
import { InputHandler } from './modules/inputHandler.js';
import { AnnotationManager } from './modules/annotationLine.js';
import { setupInitialAnnotationLines } from './modules/annotationSetup.js';
import { setupAnalysisPanel, FIVE_GRIDS_GRID_CONFIG } from './modules/fiveGridsPanel.js';
import { setupThreeTalentsPanel } from './modules/threeTalentsPanel.js';

/**
 * Initialize the name input application
 */
function init() {
    // Get DOM elements
    const nameInput = document.getElementById('name-input');
    const nameDisplay = document.getElementById('name-display');
    const nameInputContainer = document.getElementById('name-input-container');
    const annotationStackTop = document.getElementById('annotation-stack-top');
    const annotationStackBottom = document.getElementById('annotation-stack-bottom');
    const charSlots = nameDisplay.querySelectorAll('.char-slot');
    const threeTalentsContainer = document.getElementById('three-talents-content');
    const fiveGridsContainer = document.getElementById('five-grids-content');
    const toastElement = document.getElementById('toast');

    // Initialize UI components
    const toast = new Toast(toastElement);

    // Initialize input handler
    const inputHandler = new InputHandler(
        nameInput,
        nameDisplay,
        toast
    );

    // Setup event listeners
    inputHandler.setupEventListeners();
    inputHandler.setupContainerClick(nameInputContainer, nameDisplay);
    inputHandler.initialize().catch(console.error);

    // Initialize character slots
    initializeSlots(charSlots);

    // Initialize annotation manager and expose for future integrations
    const annotationManager = new AnnotationManager({
        displayElement: nameDisplay,
        topStackElement: annotationStackTop,
        bottomStackElement: annotationStackBottom
    });

    setupInitialAnnotationLines({
        inputHandler,
        annotationManager
    });

    setupThreeTalentsPanel({
        inputHandler,
        container: threeTalentsContainer
    });

    setupAnalysisPanel({
        inputHandler,
        container: fiveGridsContainer,
        grids: FIVE_GRIDS_GRID_CONFIG
    });

    window.annotationManager = annotationManager;
    window.insertPlaceholder = (metadata) => inputHandler.insertPlaceholder(metadata);
    window.getNameEntries = () => inputHandler.getEntries();

    // Focus on input when page loads
    nameInput.focus();

    // Expose toast for future modules or manual invocation
    window.appToast = toast;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Application loaded');
    init();
});
