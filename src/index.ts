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

  constructor() {
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
    this.render();
    this.loadChecklistState();
  }

  render() {
    this.node.innerHTML = `
      <div class="reprolab-header">
        <h1>ReproLab</h1>
        <h3>One step closer to accessible reproducible research</h3>
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
    `;

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
  palette: ICommandPalette
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
  const sidebarWidget = new ReprolabSidebarWidget();
  app.shell.add(sidebarWidget, 'left', { rank: 100 });
}

/**
 * Initialization data for the reprolab extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'reprolab:plugin',
  description: 'One step closer reproducible research',
  autoStart: true,
  requires: [ICommandPalette],
  activate: activateReprolab
};

export default plugin;
