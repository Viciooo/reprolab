import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  ICommandPalette
} from '@jupyterlab/apputils';

import {
  LabIcon
} from '@jupyterlab/ui-components';

import {
  Widget
} from '@lumino/widgets';

import { INotebookTracker } from '@jupyterlab/notebook';

/** SVG string for the ReproLab icon */
const REPROLAB_ICON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" viewBox="0 0 24 24">
  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="currentColor"/>
</svg>
`;

/** Create the ReproLab icon */
const reprolabIcon = new LabIcon({
  name: 'reprolab:icon',
  svgstr: REPROLAB_ICON_SVG
});

const CHECKLIST_FILE = 'reproducibility_checklist';
const DEFAULT_CHECKLIST = [
  'All code and data are version controlled',
  'Environment is specified (e.g., requirements.txt, environment.yml)',
  'Random seeds are set for reproducibility',
  'Results can be regenerated with a single command',
  'Documentation is provided for all steps',
  'Notebooks/scripts are cleaned and annotated',
  'External data sources are referenced and accessible'
];

function getXsrfToken(): string | null {
  const match = document.cookie.match('\\b_xsrf=([^;]*)\\b');
  return match ? decodeURIComponent(match[1]) : null;
}

/** The sidebar widget for the ReproLab panel */
class ReprolabSidebarWidget extends Widget {
  checklist: string[];
  checked: Record<string, boolean>;
  notebooks: INotebookTracker | undefined;
  app: JupyterFrontEnd;

  constructor(app: JupyterFrontEnd, notebooks?: INotebookTracker) {
    super();
    this.id = 'reprolab-sidebar';
    this.addClass('jp-SideBar');
    this.addClass('reprolab-sidebar');
    this.title.icon = reprolabIcon;
    this.title.label = 'ReproLab';
    this.title.caption = 'ReproLab Panel';
    this.checklist = DEFAULT_CHECKLIST;
    this.checked = {};
    this.checklist.forEach(item => { this.checked[item] = false; });
    this.notebooks = notebooks;
    this.app = app;
    this.render();
    this.loadChecklistState();
  }

  render() {
    this.node.innerHTML = `
      <div class="reprolab-header">
        <h1>ReproLab</h1>
        <h3>One step closer to accessible reproducible research</h3>
      </div>
      <div class="reprolab-demo">
        <h2>Demo</h2>
        <p>Press the button below to add a demo cell to the top of the active notebook. The cell will explain how to use the ReproLab extension.</p>
        <button id="reprolab-demo-btn" style="padding: 8px; font-size: 1em; margin-bottom: 12px;">Add Demo Cell</button>
      </div>
      <div class="reprolab-checklist">
        <h2>Reproducibility Checklist</h2>
        <ul style="list-style: none; padding: 0;">
          ${this.checklist.map(item => `
            <li>
              <label style="cursor:pointer;">
                <input type="checkbox" data-item="${encodeURIComponent(item)}" ${this.checked[item] ? 'checked' : ''} />
                ${item}
              </label>
            </li>
          `).join('')}
        </ul>
      </div>
      <div class="reprolab-archive">
        <h2>Archiving data</h2>
        <p>Currently supports s3 and minio</p>
        <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
          <input id="reprolab-archive-input1" type="password" placeholder="Access Key" style="padding: 6px; font-size: 1em;" />
          <input id="reprolab-archive-input2" type="password" placeholder="Secret Key" style="padding: 6px; font-size: 1em;" />
          <input id="reprolab-archive-input3" type="text" placeholder="Endpoint URL" style="padding: 6px; font-size: 1em;" />
          <button id="reprolab-archive-save" style="padding: 8px; font-size: 1em; margin-top: 8px;">Save</button>
        </div>
      </div>
      <div class="reprolab-section">
        <h3>Run Metrics</h3>
        <button id="reprolab-add-metrics" class="reprolab-button">Add Run Metrics</button>
      </div>
      <div class="reprolab-section">
        <h3>Gather and pin dependencies</h3>
        <button id="reprolab-gather-deps" class="reprolab-button">Do it</button>
      </div>
    `;

    // Demo button handler
    const demoBtn = this.node.querySelector('#reprolab-demo-btn');
    if (demoBtn) {
      demoBtn.setAttribute('style', (demoBtn.getAttribute('style') || '') + 'cursor:pointer;');
      demoBtn.addEventListener('click', () => {
        if (this.notebooks && this.notebooks.currentWidget) {
          const notebook = this.notebooks.currentWidget.content;
          // Select the first cell (if any exist) or ensure a cell exists
          if (notebook.model && notebook.model.cells.length > 0) {
            notebook.activeCellIndex = 0;
          } else {
            // If no cells exist, insert one to start with
            this.app.commands.execute('notebook:insert-cell-below');
            notebook.activeCellIndex = 0;
          }
          // Insert a new cell above the first cell (becomes the new top cell)
          this.app.commands.execute('notebook:insert-cell-above');
          // Directly set the content of the new cell (now at index 0)
          if (notebook.model && notebook.model.cells.length > 0) {
            const cell = notebook.model.cells.get(0);
            if (cell) {
              cell.sharedModel.setSource('# test');
            } else {
              console.error('[ReproLab] Failed to access the new cell');
            }
          } else {
            console.error('[ReproLab] No cells available after insertion');
          }
        } else {
          console.error('[ReproLab] No active notebook found');
        }
      });
    }

    // Save button handler
    const saveBtn = this.node.querySelector('#reprolab-archive-save');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const accessKey = (this.node.querySelector('#reprolab-archive-input1') as HTMLInputElement)?.value || '';
        const secretKey = (this.node.querySelector('#reprolab-archive-input2') as HTMLInputElement)?.value || '';
        const endpointUrl = (this.node.querySelector('#reprolab-archive-input3') as HTMLInputElement)?.value || '';
        // Simulate saving to environment variables by logging
        console.log('[ReproLab Archive Save]', { accessKey, secretKey, endpointUrl });
        // In the future, save to backend/environment here
      });
    }

    // Add event listeners for checkboxes
    this.node.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', (event: Event) => {
        const target = event.target as HTMLInputElement;
        const item = decodeURIComponent(target.getAttribute('data-item') || '');
        this.checked[item] = target.checked;
        this.saveChecklistState();
      });
    });

    // Add Run Metrics section
    const runMetricsSection = document.createElement('div');
    runMetricsSection.className = 'reprolab-section';
    runMetricsSection.innerHTML = `
      <h3>Run Metrics</h3>
      <button id="reprolab-add-metrics" class="reprolab-button">Add Run Metrics</button>
    `;
    this.node.appendChild(runMetricsSection);

    // Add event listener for the metrics button
    const metricsBtn = this.node.querySelector('#reprolab-add-metrics') as HTMLButtonElement;
    metricsBtn.setAttribute('style', (metricsBtn.getAttribute('style') || '') + 'cursor:pointer;');
    metricsBtn.addEventListener('click', () => {
      if (this.notebooks && this.notebooks.currentWidget) {
        const notebook = this.notebooks.currentWidget.content;
        if (notebook.model && notebook.model.cells.length > 0) {
          // Process each cell
          for (let i = 0; i < notebook.model.cells.length; i++) {
            const cell = notebook.model.cells.get(i);
            if (cell) {
              // Get current content
              const currentContent = cell.sharedModel.source;
              // Add markers
              cell.sharedModel.setSource(`#start\n${currentContent}\n#end`);
            }
          }
          console.log('[ReproLab] Added run metrics to all cells');
        } else {
          console.error('[ReproLab] No cells available in notebook');
        }
      } else {
        console.error('[ReproLab] No active notebook found');
      }
    });

    // Add Dependencies section
    const depsSection = document.createElement('div');
    depsSection.className = 'reprolab-section';
    depsSection.innerHTML = `
      <h3>Gather and pin dependencies</h3>
      <button id="reprolab-gather-deps" class="reprolab-button">Do it</button>
    `;
    this.node.appendChild(depsSection);

    // Add event listener for the dependencies button
    const depsBtn = this.node.querySelector('#reprolab-gather-deps') as HTMLButtonElement;
    depsBtn.setAttribute('style', (depsBtn.getAttribute('style') || '') + 'cursor:pointer;');
    depsBtn.addEventListener('click', () => {
      if (this.notebooks && this.notebooks.currentWidget) {
        const notebook = this.notebooks.currentWidget.content;
        if (notebook.model && notebook.model.cells.length > 0) {
          console.log('[ReproLab] Gathering dependencies...');
          
          // Extract pip commands from cells
          const pipCommands = new Set<string>();
          for (let i = 0; i < notebook.model.cells.length; i++) {
            const cell = notebook.model.cells.get(i);
            if (cell.type === 'code') {
              const source = cell.sharedModel.getSource();
              const matches = source.match(/!pip install ([^\n]+)/g);
              if (matches) {
                matches.forEach((match: string) => {
                  const packages = match.replace('!pip install', '').trim().split(/\s+/);
                  packages.forEach((pkg: string) => pipCommands.add(pkg.trim()));
                });
                // Remove the pip install commands from the cell
                const cleanedSource = source.replace(/!pip install [^\n]+\n?/g, '').trim();
                cell.sharedModel.setSource(cleanedSource);
              }
            }
          }

          const packages = Array.from(pipCommands).sort();
          console.log('[ReproLab] Found packages:', packages);

          if (packages.length > 0) {
            // Create environment.yaml content
            const envYaml = `name: reprolab-env
channels:
  - conda-forge
  - defaults
dependencies:
  - python=3.11
  - pip:
${packages.map(pkg => `    - ${pkg}`).join('\n')}`;

            // Save environment.yaml using content API
            const xsrfToken = getXsrfToken();
            fetch('/api/contents/environment.yaml', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                ...(xsrfToken ? { 'X-XSRFToken': xsrfToken } : {})
              },
              body: JSON.stringify({
                type: 'file',
                format: 'text',
                content: envYaml
              })
            }).then(response => {
              if (response.ok) {
                console.log('[ReproLab] Created environment.yaml');
                
                // Select the first cell (if any exist) or ensure a cell exists
                if (notebook.model && notebook.model.cells.length > 0) {
                  notebook.activeCellIndex = 0;
                } else {
                  // If no cells exist, insert one to start with
                  this.app.commands.execute('notebook:insert-cell-below');
                  notebook.activeCellIndex = 0;
                }

                // Insert a new cell above the first cell (becomes the new top cell)
                this.app.commands.execute('notebook:insert-cell-above');
                // Directly set the content of the new cell (now at index 0)
                if (notebook.model && notebook.model.cells.length > 0) {
                  const cell = notebook.model.cells.get(0);
                  if (cell) {
                    cell.sharedModel.setSource(`# Install dependencies from environment.yaml
!conda env update -f environment.yaml --prune`);
                  } else {
                    console.error('[ReproLab] Failed to access the new cell');
                  }
                }
              } else {
                console.error('[ReproLab] Failed to create environment.yaml');
              }
            }).catch(error => {
              console.error('[ReproLab] Error creating environment.yaml:', error);
            });
          } else {
            console.log('[ReproLab] No pip install commands found in notebook');
          }
        } else {
          console.error('[ReproLab] No cells available in notebook');
        }
      } else {
        console.error('[ReproLab] No active notebook found');
      }
    });
  }

  async loadChecklistState() {
    try {
      const response = await fetch(`/api/contents/${CHECKLIST_FILE}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.content) {
          const parsed = JSON.parse(data.content);
          if (typeof parsed === 'object' && parsed !== null) {
            // Only keep keys that are in the current checklist
            this.checked = {};
            this.checklist.forEach(item => {
              this.checked[item] = !!parsed[item];
            });
            this.render();
          }
        }
      } else if (response.status === 404) {
        // File does not exist, create it with all unchecked
        this.checked = {};
        this.checklist.forEach(item => { this.checked[item] = false; });
        await this.saveChecklistState();
        this.render();
      }
    } catch (e) {
      // Could not load or parse, fallback to all unchecked
      this.checked = {};
      this.checklist.forEach(item => { this.checked[item] = false; });
      await this.saveChecklistState();
      this.render();
    }
  }

  async saveChecklistState() {
    try {
      const xsrfToken = getXsrfToken();
      await fetch(`/api/contents/${CHECKLIST_FILE}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(xsrfToken ? { 'X-XSRFToken': xsrfToken } : {})
        },
        body: JSON.stringify({
          type: 'file',
          format: 'text',
          content: JSON.stringify(this.checked)
        })
      });
    } catch (e) {
      // Could not save
    }
  }
}

/** Activate the extension */
function activateReprolab(
  app: JupyterFrontEnd,
  palette: ICommandPalette,
  notebooks: INotebookTracker
): void {
  console.log('JupyterLab extension reprolab is activated!');

  // Add command to open the sidebar panel
  app.commands.addCommand('reprolab:open', {
    label: 'Open ReproLab Panel',
    icon: reprolabIcon,
    execute: () => {
      app.shell.activateById('reprolab-sidebar');
    }
  });

  // Add the command to the command palette
  palette.addItem({ command: 'reprolab:open', category: 'ReproLab' });

  // Add the sidebar widget (only once)
  const sidebarWidget = new ReprolabSidebarWidget(app, notebooks);
  app.shell.add(sidebarWidget, 'left', { rank: 100 });
}

/**
 * Initialization data for the reprolab extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'reprolab:plugin',
  description: 'One step closer reproducible research',
  autoStart: true,
  requires: [ICommandPalette, INotebookTracker],
  activate: activateReprolab
};

export default plugin;
