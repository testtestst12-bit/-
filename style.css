/**
 * Simulation Builder - Styles
 * Clean, modern UI with light theme and mobile support
 */

/* ========================================
   Variables
   ======================================== */
.simbuilder-container {
    --sb-primary: #4a90d9;
    --sb-primary-hover: #357abd;
    --sb-success: #28a745;
    --sb-danger: #dc3545;
    --sb-warning: #ffc107;
    --sb-info: #17a2b8;
    
    --sb-bg: #ffffff;
    --sb-bg-secondary: #f8f9fa;
    --sb-bg-hover: #e9ecef;
    --sb-border: #dee2e6;
    --sb-text: #212529;
    --sb-text-secondary: #6c757d;
    
    --sb-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    --sb-shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.15);
    --sb-radius: 8px;
    --sb-radius-sm: 4px;
    --sb-transition: 0.2s ease;
}

/* ========================================
   Container
   ======================================== */
.simbuilder-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    color: var(--sb-text);
}

/* ========================================
   Status Window
   ======================================== */
.simbuilder-status-window {
    background: var(--sb-bg);
    border: 1px solid var(--sb-border);
    border-radius: var(--sb-radius);
    box-shadow: var(--sb-shadow);
    width: 280px;
    max-height: 400px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.simbuilder-status-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    background: var(--sb-bg-secondary);
    border-bottom: 1px solid var(--sb-border);
    cursor: move;
}

.simbuilder-status-title {
    font-weight: 600;
    font-size: 14px;
}

.simbuilder-status-controls {
    display: flex;
    gap: 4px;
}

.simbuilder-status-content {
    padding: 12px;
    overflow-y: auto;
    max-height: 320px;
}

/* ========================================
   Buttons
   ======================================== */
.simbuilder-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px 12px;
    border: 1px solid var(--sb-border);
    border-radius: var(--sb-radius-sm);
    background: var(--sb-bg);
    color: var(--sb-text);
    font-size: 13px;
    cursor: pointer;
    transition: all var(--sb-transition);
    white-space: nowrap;
}

.simbuilder-btn:hover {
    background: var(--sb-bg-hover);
}

.simbuilder-btn:active {
    transform: scale(0.98);
}

.simbuilder-btn-primary {
    background: var(--sb-primary);
    border-color: var(--sb-primary);
    color: white;
}

.simbuilder-btn-primary:hover {
    background: var(--sb-primary-hover);
    border-color: var(--sb-primary-hover);
}

.simbuilder-btn-danger {
    background: var(--sb-danger);
    border-color: var(--sb-danger);
    color: white;
}

.simbuilder-btn-danger:hover {
    background: #c82333;
    border-color: #bd2130;
}

.simbuilder-btn-icon {
    padding: 4px 8px;
    min-width: 28px;
    font-size: 12px;
}

.simbuilder-btn-small {
    padding: 2px 8px;
    font-size: 12px;
    min-width: 24px;
}

.simbuilder-btn-add {
    width: 100%;
    margin-top: 8px;
    border-style: dashed;
    color: var(--sb-text-secondary);
}

.simbuilder-btn-add:hover {
    border-color: var(--sb-primary);
    color: var(--sb-primary);
}

/* ========================================
   Stat Display
   ======================================== */
.simbuilder-stat {
    padding: 8px;
    margin-bottom: 8px;
    background: var(--sb-bg-secondary);
    border-radius: var(--sb-radius-sm);
    transition: all var(--sb-transition);
}

.simbuilder-stat:last-of-type {
    margin-bottom: 0;
}

.simbuilder-stat-changed {
    animation: simbuilder-pulse 0.3s ease;
}

@keyframes simbuilder-pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.02); background: var(--sb-bg-hover); }
    100% { transform: scale(1); }
}

.simbuilder-stat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
}

.simbuilder-stat-name {
    font-weight: 500;
    font-size: 13px;
}

.simbuilder-stat-value {
    font-size: 12px;
    color: var(--sb-text-secondary);
    font-family: 'Consolas', 'Monaco', monospace;
}

.simbuilder-stat-bar-container {
    height: 8px;
    background: var(--sb-border);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 6px;
}

.simbuilder-stat-bar {
    height: 100%;
    border-radius: 4px;
    transition: width var(--sb-transition);
}

.simbuilder-stat-controls {
    display: flex;
    gap: 4px;
    justify-content: flex-end;
}

.simbuilder-stat-controls .simbuilder-btn-edit {
    margin-left: auto;
}

/* ========================================
   Empty State
   ======================================== */
.simbuilder-empty-state {
    text-align: center;
    padding: 20px;
    color: var(--sb-text-secondary);
}

.simbuilder-empty-state p {
    margin: 0 0 12px 0;
}

/* ========================================
   Settings Panel
   ======================================== */
.simbuilder-settings-panel {
    position: absolute;
    bottom: calc(100% + 8px);
    right: 0;
    width: 280px;
    background: var(--sb-bg);
    border: 1px solid var(--sb-border);
    border-radius: var(--sb-radius);
    box-shadow: var(--sb-shadow-lg);
    overflow: hidden;
}

.simbuilder-settings-header {
    padding: 10px 12px;
    background: var(--sb-bg-secondary);
    border-bottom: 1px solid var(--sb-border);
}

.simbuilder-settings-header h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
}

.simbuilder-settings-content {
    padding: 12px;
    max-height: 400px;
    overflow-y: auto;
}

.simbuilder-settings-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    flex-wrap: wrap;
}

.simbuilder-settings-actions .simbuilder-btn {
    flex: 1;
    min-width: 70px;
}

/* ========================================
   New UI Elements
   ======================================== */
.simbuilder-divider {
    border: none;
    border-top: 1px solid var(--sb-border);
    margin: 12px 0;
}

.simbuilder-select {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid var(--sb-border);
    border-radius: var(--sb-radius-sm);
    font-size: 14px;
    color: var(--sb-text);
    background: var(--sb-bg);
    cursor: pointer;
    transition: border-color var(--sb-transition);
}

.simbuilder-select:focus {
    outline: none;
    border-color: var(--sb-primary);
}

.simbuilder-preset-row {
    display: flex;
    gap: 4px;
    align-items: center;
}

.simbuilder-flex-1 {
    flex: 1;
}

.simbuilder-btn-secondary {
    background: var(--sb-bg-secondary);
    border-color: var(--sb-border);
}

.simbuilder-btn-secondary:hover {
    background: var(--sb-bg-hover);
    border-color: var(--sb-primary);
}

.simbuilder-btn-full {
    width: 100%;
}

.simbuilder-help-text {
    display: block;
    font-size: 11px;
    color: var(--sb-text-secondary);
    margin-top: 4px;
    line-height: 1.4;
}

.simbuilder-form-group textarea {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid var(--sb-border);
    border-radius: var(--sb-radius-sm);
    font-size: 14px;
    color: var(--sb-text);
    background: var(--sb-bg);
    resize: vertical;
    font-family: inherit;
    transition: border-color var(--sb-transition);
}

.simbuilder-form-group textarea:focus {
    outline: none;
    border-color: var(--sb-primary);
}

/* ========================================
   Dialog
   ======================================== */
.simbuilder-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.simbuilder-dialog {
    background: var(--sb-bg);
    border-radius: var(--sb-radius);
    box-shadow: var(--sb-shadow-lg);
    width: 90%;
    max-width: 400px;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.simbuilder-dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: var(--sb-bg-secondary);
    border-bottom: 1px solid var(--sb-border);
}

.simbuilder-dialog-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
}

.simbuilder-dialog-content {
    padding: 16px;
    overflow-y: auto;
}

.simbuilder-dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 16px;
    background: var(--sb-bg-secondary);
    border-top: 1px solid var(--sb-border);
}

.simbuilder-dialog-footer .simbuilder-btn-danger {
    margin-right: auto;
}

/* ========================================
   Form Elements
   ======================================== */
.simbuilder-form-group {
    margin-bottom: 12px;
}

.simbuilder-form-group:last-child {
    margin-bottom: 0;
}

.simbuilder-form-group label {
    display: block;
    margin-bottom: 4px;
    font-size: 13px;
    font-weight: 500;
    color: var(--sb-text-secondary);
}

.simbuilder-form-group input[type="text"],
.simbuilder-form-group input[type="number"],
.simbuilder-form-group select {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid var(--sb-border);
    border-radius: var(--sb-radius-sm);
    font-size: 14px;
    color: var(--sb-text);
    background: var(--sb-bg);
    transition: border-color var(--sb-transition);
}

.simbuilder-form-group input:focus,
.simbuilder-form-group select:focus {
    outline: none;
    border-color: var(--sb-primary);
}

.simbuilder-form-group input[type="color"] {
    width: 100%;
    height: 36px;
    padding: 2px;
    border: 1px solid var(--sb-border);
    border-radius: var(--sb-radius-sm);
    cursor: pointer;
}

.simbuilder-form-group input[type="checkbox"] {
    margin-right: 8px;
    cursor: pointer;
}

.simbuilder-form-group label:has(input[type="checkbox"]) {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.simbuilder-form-row {
    display: flex;
    gap: 12px;
}

.simbuilder-form-row .simbuilder-form-group {
    flex: 1;
}

/* ========================================
   Notifications
   ======================================== */
.simbuilder-notification {
    position: absolute;
    top: -40px;
    left: 0;
    right: 0;
    padding: 8px 12px;
    border-radius: var(--sb-radius-sm);
    font-size: 13px;
    text-align: center;
    animation: simbuilder-slide-in 0.3s ease;
}

@keyframes simbuilder-slide-in {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.simbuilder-notification-hide {
    animation: simbuilder-slide-out 0.3s ease forwards;
}

@keyframes simbuilder-slide-out {
    from {
        opacity: 1;
        transform: translateY(0);
    }
    to {
        opacity: 0;
        transform: translateY(-10px);
    }
}

.simbuilder-notification-positive {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.simbuilder-notification-negative {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

.simbuilder-notification-info {
    background: #d1ecf1;
    color: #0c5460;
    border: 1px solid #bee5eb;
}

/* ========================================
   Extension Settings (SillyTavern Panel)
   ======================================== */
.simbuilder-extension-settings {
    padding: 10px;
}

.simbuilder-extension-settings .inline-drawer-content {
    padding: 10px;
}

.simbuilder-settings-row {
    margin-bottom: 10px;
}

.simbuilder-settings-row label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

.simbuilder-settings-row select {
    width: 100%;
    padding: 6px 8px;
    border-radius: 4px;
    margin-top: 4px;
}

.simbuilder-settings-info {
    font-size: 12px;
    color: var(--sb-text-secondary);
}

.simbuilder-settings-info code {
    background: var(--sb-bg-secondary);
    padding: 2px 4px;
    border-radius: 3px;
    font-family: 'Consolas', 'Monaco', monospace;
}

.simbuilder-settings-info ul {
    margin: 8px 0;
    padding-left: 20px;
}

.simbuilder-settings-info li {
    margin-bottom: 4px;
}

/* ========================================
   Mobile Responsive
   ======================================== */
@media (max-width: 768px) {
    .simbuilder-container {
        bottom: 10px;
        right: 10px;
        left: 10px;
    }

    .simbuilder-status-window {
        width: 100%;
        max-height: 300px;
    }

    .simbuilder-settings-panel {
        width: 100%;
        left: 0;
    }

    .simbuilder-dialog {
        width: 95%;
        max-width: none;
    }

    .simbuilder-form-row {
        flex-direction: column;
        gap: 0;
    }
}

/* ========================================
   Dark Mode Support (optional)
   ======================================== */
@media (prefers-color-scheme: dark) {
    .simbuilder-container {
        --sb-bg: #2d2d2d;
        --sb-bg-secondary: #3d3d3d;
        --sb-bg-hover: #4d4d4d;
        --sb-border: #555555;
        --sb-text: #e0e0e0;
        --sb-text-secondary: #aaaaaa;
    }

    .simbuilder-notification-positive {
        background: #1e4620;
        color: #a3cfbb;
        border-color: #2a5a2e;
    }

    .simbuilder-notification-negative {
        background: #5c1e24;
        color: #e4a9ae;
        border-color: #7a2830;
    }

    .simbuilder-notification-info {
        background: #1a4654;
        color: #9bcfdb;
        border-color: #245a6c;
    }
}

/* ========================================
   Scrollbar Styling
   ======================================== */
.simbuilder-status-content::-webkit-scrollbar {
    width: 6px;
}

.simbuilder-status-content::-webkit-scrollbar-track {
    background: var(--sb-bg-secondary);
    border-radius: 3px;
}

.simbuilder-status-content::-webkit-scrollbar-thumb {
    background: var(--sb-border);
    border-radius: 3px;
}

.simbuilder-status-content::-webkit-scrollbar-thumb:hover {
    background: var(--sb-text-secondary);
}
