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

import { createButton } from './utils';
import { ChecklistSection } from './sections/checklist';
import { DemoSection } from './sections/demo';
import { ArchiveSection } from './sections/archive';
import { MetricsSection } from './sections/metrics';
import { DependenciesSection } from './sections/dependencies';
import { ZenodoSection } from './sections/zenodo';
import { ExperimentSection } from './sections/experiment';

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
  private demoSection: DemoSection;
  private archiveSection: ArchiveSection;
  private metricsSection: MetricsSection;
  private dependenciesSection: DependenciesSection;
  private zenodoSection: ZenodoSection;
  private experimentSection: ExperimentSection;
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
    this.demoSection = new DemoSection(app, notebooks);
    this.archiveSection = new ArchiveSection();
    this.metricsSection = new MetricsSection(notebooks);
    this.dependenciesSection = new DependenciesSection(app, notebooks);
    this.zenodoSection = new ZenodoSection();
    this.experimentSection = new ExperimentSection();
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
    const demoHtml = this.demoSection.render();
    container.appendChild(document.createRange().createContextualFragment(demoHtml));

    // Checklist section
    const checklistHtml = this.checklistSection.render();
    container.appendChild(document.createRange().createContextualFragment(checklistHtml));

    // Archive section
    const archiveHtml = this.archiveSection.render();
    container.appendChild(document.createRange().createContextualFragment(archiveHtml));

    // Run Metrics section
    const metricsHtml = this.metricsSection.render();
    container.appendChild(document.createRange().createContextualFragment(metricsHtml));

    // Dependencies section
    const depsHtml = this.dependenciesSection.render();
    container.appendChild(document.createRange().createContextualFragment(depsHtml));

    // Zenodo section
    const zenodoHtml = this.zenodoSection.render();
    container.appendChild(document.createRange().createContextualFragment(zenodoHtml));

    // Experiment section
    const experimentHtml = this.experimentSection.render();
    container.appendChild(document.createRange().createContextualFragment(experimentHtml));

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
      demoBtn.addEventListener('click', () => this.demoSection.handleDemoButton());
    }

    // Save button handler
    const saveBtn = this.node.querySelector('#reprolab-archive-save');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.archiveSection.handleSaveButton(this.node));
    }

    // Checkbox handlers
    this.node.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', (event: Event) => this.checklistSection.handleCheckboxChange(event));
    });

    // Metrics button handler
    const metricsBtn = this.node.querySelector('#reprolab-add-metrics');
    if (metricsBtn) {
      metricsBtn.addEventListener('click', () => this.metricsSection.handleMetricsButton());
    }

    // Dependencies button handler
    const depsBtn = this.node.querySelector('#reprolab-gather-deps');
    if (depsBtn) {
      depsBtn.addEventListener('click', () => this.dependenciesSection.handleDependenciesButton());
    }

    // Zenodo button handler
    const zenodoBtn = this.node.querySelector('#reprolab-zenodo-more');
    if (zenodoBtn) {
      zenodoBtn.addEventListener('click', () => this.zenodoSection.handleZenodoButton(modal));
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
      createExperimentBtn.addEventListener('click', () => this.experimentSection.handleCreateExperiment(this.node));
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
