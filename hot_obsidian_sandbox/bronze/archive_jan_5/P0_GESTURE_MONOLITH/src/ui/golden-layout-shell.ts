/**
 * 🎯 GOLDEN LAYOUT SHELL
 * 
 * Main UI shell using GoldenLayout for dockable panels.
 * Manages: Webcam Preview, Target Canvas, Settings, Debug Console
 * 
 * @provenance .kiro/specs/gesture-pointer-monolith/design.md
 * Validates: Requirements 5.1, 5.6, 5.7
 */

import { GoldenLayout, LayoutConfig, ComponentContainer, ContentItem } from 'golden-layout';

// Panel component types
export type PanelType = 'webcam-preview' | 'target-canvas' | 'settings-panel' | 'debug-console';

export interface PanelFactory {
  create(container: ComponentContainer): void;
  destroy?(): void;
}

export interface ShellConfig {
  layoutKey?: string;
  defaultLayout?: LayoutConfig;
}

const STORAGE_KEY = 'gesture-monolith-layout';

// Default layout configuration
const DEFAULT_LAYOUT: LayoutConfig = {
  root: {
    type: 'row',
    content: [
      {
        type: 'column',
        width: 70,
        content: [
          {
            type: 'component',
            componentType: 'target-canvas',
            title: '🎯 Target Canvas',
            height: 70,
          },
          {
            type: 'component',
            componentType: 'debug-console',
            title: '📋 Debug Console',
            height: 30,
          },
        ],
      },
      {
        type: 'column',
        width: 30,
        content: [
          {
            type: 'component',
            componentType: 'webcam-preview',
            title: '📹 Webcam Preview',
            height: 50,
          },
          {
            type: 'component',
            componentType: 'settings-panel',
            title: '⚙️ Settings',
            height: 50,
          },
        ],
      },
    ],
  },
};

// Preset layouts
export const PRESET_LAYOUTS = {
  debug: DEFAULT_LAYOUT,
  minimal: {
    root: {
      type: 'row',
      content: [
        {
          type: 'component',
          componentType: 'target-canvas',
          title: '🎯 Target Canvas',
        },
      ],
    },
  } as LayoutConfig,
  presentation: {
    root: {
      type: 'row',
      content: [
        {
          type: 'component',
          componentType: 'target-canvas',
          title: '🎯 Target Canvas',
          width: 80,
        },
        {
          type: 'component',
          componentType: 'webcam-preview',
          title: '📹 Webcam Preview',
          width: 20,
        },
      ],
    },
  } as LayoutConfig,
};

export class GoldenLayoutShell {
  private layout: GoldenLayout | null = null;
  private container: HTMLElement;
  private factories: Map<PanelType, PanelFactory> = new Map();
  private config: ShellConfig;

  constructor(container: HTMLElement, config: ShellConfig = {}) {
    this.container = container;
    this.config = {
      layoutKey: config.layoutKey ?? STORAGE_KEY,
      defaultLayout: config.defaultLayout ?? DEFAULT_LAYOUT,
    };
  }

  /**
   * Register a panel factory
   */
  registerPanel(type: PanelType, factory: PanelFactory): void {
    this.factories.set(type, factory);
  }

  /**
   * Initialize GoldenLayout
   */
  init(): void {
    // Try to load saved layout
    const savedLayout = this.loadLayout();
    const layoutConfig = savedLayout ?? this.config.defaultLayout!;

    this.layout = new GoldenLayout(this.container);

    // Register all panel components
    for (const [type, factory] of this.factories) {
      this.layout.registerComponentFactoryFunction(type, (container) => {
        factory.create(container);
      });
    }

    // Load layout
    this.layout.loadLayout(layoutConfig);

    // Save layout on state change
    this.layout.on('stateChanged', () => {
      this.saveLayout();
    });

    // Handle resize
    window.addEventListener('resize', () => {
      this.layout?.setSize(this.container.clientWidth, this.container.clientHeight);
    });
  }


  /**
   * Save current layout to localStorage
   */
  saveLayout(): void {
    if (!this.layout) return;
    try {
      const config = this.layout.saveLayout();
      localStorage.setItem(this.config.layoutKey!, JSON.stringify(config));
    } catch (e) {
      console.warn('Failed to save layout:', e);
    }
  }

  /**
   * Load layout from localStorage
   */
  loadLayout(): LayoutConfig | null {
    try {
      const saved = localStorage.getItem(this.config.layoutKey!);
      if (saved) {
        return JSON.parse(saved) as LayoutConfig;
      }
    } catch (e) {
      console.warn('Failed to load layout:', e);
    }
    return null;
  }

  /**
   * Apply a preset layout
   */
  applyPreset(preset: keyof typeof PRESET_LAYOUTS): void {
    if (!this.layout) return;
    const config = PRESET_LAYOUTS[preset];
    this.layout.loadLayout(config);
  }

  /**
   * Reset to default layout
   */
  resetLayout(): void {
    localStorage.removeItem(this.config.layoutKey!);
    if (this.layout) {
      this.layout.loadLayout(this.config.defaultLayout!);
    }
  }

  /**
   * Get GoldenLayout instance
   */
  getLayout(): GoldenLayout | null {
    return this.layout;
  }

  /**
   * Destroy shell
   */
  destroy(): void {
    if (this.layout) {
      this.layout.destroy();
      this.layout = null;
    }
    for (const factory of this.factories.values()) {
      factory.destroy?.();
    }
    this.factories.clear();
  }
}
