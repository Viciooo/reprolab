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

import { createSection, createButton, createInput, getXsrfToken } from './utils';
import { ChecklistSection } from './sections/checklist';

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

/** The sidebar widget for the ReproLab panel */
class ReprolabSidebarWidget extends Widget {
  private checklistSection: ChecklistSection;
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
    this.checklistSection = new ChecklistSection();
    this.notebooks = notebooks;
    this.app = app;
    this.render();
    this.checklistSection.loadChecklistState().then(() => this.render());
  }

  render() {
    // Create main container
    const container = document.createElement('div');
    
    // Header section
    const header = document.createElement('div');
    header.className = 'reprolab-header';
    header.innerHTML = `
      <h1>ReproLab</h1>
      <h3>One step closer to accessible reproducible research</h3>
    `;
    container.appendChild(header);

    // Demo section
    const demoContent = document.createElement('div');
    demoContent.innerHTML = '<p>Press the button below to add a demo cell to the top of the active notebook. The cell will explain how to use the ReproLab extension.</p>';
    demoContent.appendChild(createButton('reprolab-demo-btn', 'Add Demo Cell'));
    container.appendChild(createSection('Demo', demoContent.innerHTML));

    // Checklist section
    const checklistHtml = this.checklistSection.render();
    container.appendChild(document.createRange().createContextualFragment(checklistHtml));

    // Archive section
    const archiveContent = document.createElement('div');
    archiveContent.innerHTML = '<p>Currently supports s3 and minio</p>';
    const archiveInputs = document.createElement('div');
    archiveInputs.className = 'reprolab-archive-inputs';
    
    archiveInputs.appendChild(createInput('reprolab-archive-input1', 'password', 'Access Key'));
    archiveInputs.appendChild(createInput('reprolab-archive-input2', 'password', 'Secret Key'));
    archiveInputs.appendChild(createInput('reprolab-archive-input3', 'text', 'Endpoint URL'));
    archiveInputs.appendChild(createButton('reprolab-archive-save', 'Save'));
    
    archiveContent.appendChild(archiveInputs);
    container.appendChild(createSection('Archiving data', archiveContent.innerHTML));

    // Run Metrics section
    const metricsContent = document.createElement('div');
    metricsContent.appendChild(createButton('reprolab-add-metrics', 'Add Run Metrics'));
    container.appendChild(createSection('Run Metrics', metricsContent.innerHTML));

    // Dependencies section
    const depsContent = document.createElement('div');
    depsContent.appendChild(createButton('reprolab-gather-deps', 'Do it'));
    container.appendChild(createSection('Gather and pin dependencies', depsContent.innerHTML));

    // Zenodo section
    const zenodoContent = document.createElement('div');
    zenodoContent.innerHTML = '<p>You can in a few steps download the raw datasets and save the snapshots of software to the Zenodo for archiving</p>';
    zenodoContent.appendChild(createButton('reprolab-zenodo-more', 'See more'));
    container.appendChild(createSection('Publishing software and data to Zenodo', zenodoContent.innerHTML));

    // Experiment section
    const experimentContent = document.createElement('div');
    experimentContent.innerHTML = '<p>For reproducible experiments its crucial to preserve exact immutable snapshot of software. Creating experiments using ReproLab executes your notebook code top to bottom and saves the end result under git tag.</p>';
    
    const experimentInput = document.createElement('div');
    experimentInput.className = 'reprolab-experiment-input';
    
    const label = document.createElement('label');
    label.className = 'reprolab-experiment-label';
    label.textContent = 'Suggested tag:';
    label.htmlFor = 'reprolab-experiment-tag';
    
    const input = createInput('reprolab-experiment-tag', 'text', '');
    input.value = 'v1.0.0';
    
    experimentInput.appendChild(label);
    experimentInput.appendChild(input);
    experimentInput.appendChild(createButton('reprolab-create-experiment', 'Create experiment'));
    
    experimentContent.appendChild(experimentInput);
    container.appendChild(createSection('Create experiment', experimentContent.innerHTML));

    // Set the container as the widget's content
    this.node.innerHTML = '';
    this.node.appendChild(container);

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'reprolab-modal';
    const modalContent = document.createElement('div');
    modalContent.className = 'reprolab-modal-content';
    
    const closeButton = document.createElement('span');
    closeButton.className = 'reprolab-modal-close';
    closeButton.textContent = '×';
    
    const modalText = document.createElement('p');
    modalText.textContent = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
    
    const testButton = createButton('reprolab-modal-test', 'Test');
    
    modalContent.appendChild(closeButton);
    modalContent.appendChild(modalText);
    modalContent.appendChild(testButton);
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Add event listeners
    this.setupEventListeners(modal);
  }

  private setupEventListeners(modal: HTMLElement) {
    // Demo button handler
    const demoBtn = this.node.querySelector('#reprolab-demo-btn');
    if (demoBtn) {
      demoBtn.addEventListener('click', () => this.handleDemoButton());
    }

    // Save button handler
    const saveBtn = this.node.querySelector('#reprolab-archive-save');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.handleSaveButton());
    }

    // Checkbox handlers
    this.node.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', (event: Event) => this.checklistSection.handleCheckboxChange(event));
    });

    // Metrics button handler
    const metricsBtn = this.node.querySelector('#reprolab-add-metrics');
    if (metricsBtn) {
      metricsBtn.addEventListener('click', () => this.handleMetricsButton());
    }

    // Dependencies button handler
    const depsBtn = this.node.querySelector('#reprolab-gather-deps');
    if (depsBtn) {
      depsBtn.addEventListener('click', () => this.handleDependenciesButton());
    }

    // Zenodo button handler
    const zenodoBtn = this.node.querySelector('#reprolab-zenodo-more');
    if (zenodoBtn) {
      zenodoBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
      });
    }

    // Modal close button handler
    const closeBtn = modal.querySelector('.reprolab-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }

    // Modal test button handler
    const modalTestBtn = modal.querySelector('#reprolab-modal-test');
    if (modalTestBtn) {
      modalTestBtn.addEventListener('click', () => {
        console.log('test from the modal');
      });
    }

    // Close modal when clicking outside
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });

    // Create experiment button handler
    const createExperimentBtn = this.node.querySelector('#reprolab-create-experiment');
    if (createExperimentBtn) {
      createExperimentBtn.addEventListener('click', () => this.handleCreateExperiment());
    }
  }

  private handleDemoButton() {
    if (this.notebooks && this.notebooks.currentWidget) {
      const notebook = this.notebooks.currentWidget.content;
      if (notebook.model && notebook.model.cells.length > 0) {
        notebook.activeCellIndex = 0;
      } else {
        this.app.commands.execute('notebook:insert-cell-below');
        notebook.activeCellIndex = 0;
      }
      this.app.commands.execute('notebook:insert-cell-above');
      if (notebook.model && notebook.model.cells.length > 0) {
        const cell = notebook.model.cells.get(0);
        if (cell) {
          cell.sharedModel.setSource('# test');
        }
      }
    }
  }

  private handleSaveButton() {
    const accessKey = (this.node.querySelector('#reprolab-archive-input1') as HTMLInputElement)?.value || '';
    const secretKey = (this.node.querySelector('#reprolab-archive-input2') as HTMLInputElement)?.value || '';
    const endpointUrl = (this.node.querySelector('#reprolab-archive-input3') as HTMLInputElement)?.value || '';
    console.log('[ReproLab Archive Save]', { accessKey, secretKey, endpointUrl });
  }

  private handleMetricsButton() {
    if (this.notebooks && this.notebooks.currentWidget) {
      const notebook = this.notebooks.currentWidget.content;
      if (notebook.model && notebook.model.cells.length > 0) {
        for (let i = 0; i < notebook.model.cells.length; i++) {
          const cell = notebook.model.cells.get(i);
          if (cell) {
            const currentContent = cell.sharedModel.source;
            cell.sharedModel.setSource(`#start\n${currentContent}\n#end`);
          }
        }
        console.log('[ReproLab] Added run metrics to all cells');
      }
    }
  }

  private handleDependenciesButton() {
    if (this.notebooks && this.notebooks.currentWidget) {
      const notebook = this.notebooks.currentWidget.content;
      if (notebook.model && notebook.model.cells.length > 0) {
        console.log('[ReproLab] Gathering dependencies...');
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
              const cleanedSource = source.replace(/!pip install [^\n]+\n?/g, '').trim();
              cell.sharedModel.setSource(cleanedSource);
            }
          }
        }

        const packages = Array.from(pipCommands).sort();
        if (packages.length > 0) {
          this.createEnvironmentYaml(packages);
        }
      }
    }
  }

  private async createEnvironmentYaml(packages: string[]) {
    const envYaml = `name: reprolab-env
channels:
  - conda-forge
  - defaults
dependencies:
  - python=3.11
  - pip:
${packages.map(pkg => `    - ${pkg}`).join('\n')}`;

    const xsrfToken = getXsrfToken();
    try {
      const response = await fetch('/api/contents/environment.yaml', {
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
      });

      if (response.ok) {
        console.log('[ReproLab] Created environment.yaml');
        this.addEnvironmentCell();
      } else {
        console.error('[ReproLab] Failed to create environment.yaml');
      }
    } catch (error) {
      console.error('[ReproLab] Error creating environment.yaml:', error);
    }
  }

  private addEnvironmentCell() {
    if (this.notebooks && this.notebooks.currentWidget) {
      const notebook = this.notebooks.currentWidget.content;
      if (notebook.model && notebook.model.cells.length > 0) {
        notebook.activeCellIndex = 0;
      } else {
        this.app.commands.execute('notebook:insert-cell-below');
        notebook.activeCellIndex = 0;
      }
      this.app.commands.execute('notebook:insert-cell-above');
      if (notebook.model && notebook.model.cells.length > 0) {
        const cell = notebook.model.cells.get(0);
        if (cell) {
          cell.sharedModel.setSource(`# Install dependencies from environment.yaml
!conda env update -f environment.yaml --prune`);
        }
      }
    }
  }

  private handleCreateExperiment() {
    const tagInput = this.node.querySelector('#reprolab-experiment-tag') as HTMLInputElement;
    const tag = tagInput.value;
    console.log(`[ReproLab] Creating experiment with tag: ${tag}`);
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
