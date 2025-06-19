import { createSection, createButton } from '../utils';
import { INotebookTracker } from '@jupyterlab/notebook';
import { JupyterFrontEnd } from '@jupyterlab/application';

export class ExperimentSection {
  private modal: HTMLElement | null = null;
  private notebooks: INotebookTracker | undefined;
  private app: JupyterFrontEnd;

  constructor(app: JupyterFrontEnd, notebooks?: INotebookTracker) {
    this.app = app;
    this.notebooks = notebooks;
  }

  render(): string {
    const experimentContent = document.createElement('div');
    experimentContent.innerHTML = '<p>For reproducible experiments its crucial to preserve exact immutable snapshot of software. Creating experiments using ReproLab executes your notebook code top to bottom and saves the end result under git tag.</p>';
    experimentContent.appendChild(createButton('reprolab-experiment-see-more', 'See more'));
    const section = createSection('Create experiment', experimentContent.innerHTML);
    return section.outerHTML;
  }

  handleCreateExperimentSeeMore(node: HTMLElement): void {
    if (!this.modal) {
      this.createModal();
    }
    if (this.modal) {
      this.modal.style.display = 'flex';
    }
  }

  private createModal(): void {
    // Create modal container
    this.modal = document.createElement('div');
    this.modal.className = 'reprolab-modal';

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'reprolab-modal-content';

    // Create close button
    const closeButton = document.createElement('span');
    closeButton.className = 'reprolab-modal-close';
    closeButton.textContent = '×';
    closeButton.addEventListener('click', () => {
      if (this.modal) {
        this.modal.style.display = 'none';
      }
    });

    // Create input container
    const inputContainer = document.createElement('div');
    inputContainer.className = 'reprolab-experiment-input';

    // Create options container
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'reprolab-experiment-options';

    // Create metrics checkbox
    const metricsLabel = document.createElement('label');
    metricsLabel.className = 'reprolab-checkbox-label';
    const metricsCheckbox = document.createElement('input');
    metricsCheckbox.type = 'checkbox';
    metricsCheckbox.id = 'reprolab-metrics-checkbox';
    metricsLabel.appendChild(metricsCheckbox);
    metricsLabel.appendChild(document.createTextNode('Add run metrics to cells'));

    // Create dependencies checkbox
    const depsLabel = document.createElement('label');
    depsLabel.className = 'reprolab-checkbox-label';
    const depsCheckbox = document.createElement('input');
    depsCheckbox.type = 'checkbox';
    depsCheckbox.id = 'reprolab-deps-checkbox';
    depsLabel.appendChild(depsCheckbox);
    depsLabel.appendChild(document.createTextNode('Gather and pin dependencies'));

    optionsContainer.appendChild(metricsLabel);
    optionsContainer.appendChild(depsLabel);

    // Create experiment button
    const createButton = document.createElement('button');
    createButton.className = 'reprolab-button';
    createButton.textContent = 'Create experiment';
    createButton.addEventListener('click', () => {
      const metricsCheckbox = document.querySelector('#reprolab-metrics-checkbox') as HTMLInputElement;
      const depsCheckbox = document.querySelector('#reprolab-deps-checkbox') as HTMLInputElement;

      console.log('[ReproLab] Creating experiment...');
      
      // Handle metrics if checked
      if (metricsCheckbox && metricsCheckbox.checked) {
        this.handleMetrics();
      }

      // Handle dependencies if checked
      if (depsCheckbox && depsCheckbox.checked) {
        this.handleDependencies();
      }

      // Create the experiment
      this.createExperiment();
    });

    // Assemble the modal
    inputContainer.appendChild(optionsContainer);
    inputContainer.appendChild(createButton);

    modalContent.appendChild(closeButton);
    modalContent.appendChild(inputContainer);

    this.modal.appendChild(modalContent);
    document.body.appendChild(this.modal);

    // Close modal when clicking outside
    this.modal.addEventListener('click', event => {
      if (this.modal && event.target === this.modal) {
        this.modal.style.display = 'none';
      }
    });
  }

  private async createExperiment(): Promise<void> {
    if (!this.notebooks || !this.notebooks.currentWidget) {
      console.error('[ReproLab] No active notebook found');
      return;
    }

    const notebook = this.notebooks.currentWidget.content;
    if (!notebook.model) {
      console.error('[ReproLab] No notebook model found');
      return;
    }

    try {
      // Save all notebooks first to preserve current state
      console.log('[ReproLab] Saving notebook before experiment...');
      await this.app.commands.execute('docmanager:save-all');
      
      // Wait a moment for save to complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // Save current state
      const originalCellCount = notebook.model.cells.length;
      console.log(`[ReproLab] Original notebook has ${originalCellCount} cells`);

      // Add start_experiment cell at the top
      notebook.activeCellIndex = 0;
      this.app.commands.execute('notebook:insert-cell-above');
      
      // Wait a moment for the cell to be created
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const startCell = notebook.model.cells.get(0);
      if (startCell) {
        startCell.sharedModel.setSource(
          `from reprolab import start_experiment, end_experiment
start_experiment()`
        );
        console.log('[ReproLab] Added start_experiment cell');
      }

      // Add end_experiment cell at the bottom
      notebook.activeCellIndex = notebook.model.cells.length - 1;
      this.app.commands.execute('notebook:insert-cell-below');
      
      // Wait a moment for the cell to be created
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const endCell = notebook.model.cells.get(notebook.model.cells.length - 1);
      if (endCell) {
        endCell.sharedModel.setSource('end_experiment()');
        console.log('[ReproLab] Added end_experiment cell');
      }

      console.log(`[ReproLab] Notebook now has ${notebook.model.cells.length} cells`);

      // Run all cells
      console.log('[ReproLab] Running all cells...');
      await this.app.commands.execute('notebook:run-all-cells');

      // Wait a bit for execution to complete
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('[ReproLab] Experiment completed successfully');

      // Close the modal
      if (this.modal) {
        this.modal.style.display = 'none';
      }
    } catch (error) {
      console.error('[ReproLab] Error creating experiment:', error);
    }
  }

  private handleMetrics(): void {
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

  private handleDependencies(): void {
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

  private async createEnvironmentYaml(packages: string[]): Promise<void> {
    const envYaml = `name: reprolab-env
channels:
  - conda-forge
  - defaults
dependencies:
  - python=3.11
  - pip:
${packages.map(pkg => `    - ${pkg}`).join('\n')}`;

    const xsrfToken = document.cookie.split('; ').find(row => row.startsWith('_xsrf='))?.split('=')[1];
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

  private addEnvironmentCell(): void {
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
}
