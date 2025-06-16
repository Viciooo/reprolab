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

    // Create label
    const label = document.createElement('label');
    label.className = 'reprolab-experiment-label';
    label.textContent = 'Suggested tag:';
    label.htmlFor = 'reprolab-experiment-tag';

    // Create input
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'reprolab-experiment-tag';
    input.className = 'reprolab-input';
    input.value = 'v1.0.0';

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
      const tagInput = document.querySelector('#reprolab-experiment-tag') as HTMLInputElement;
      const metricsCheckbox = document.querySelector('#reprolab-metrics-checkbox') as HTMLInputElement;
      const depsCheckbox = document.querySelector('#reprolab-deps-checkbox') as HTMLInputElement;

      if (tagInput) {
        console.log(`[ReproLab] Creating experiment with tag: ${tagInput.value}`);
        
        // Handle metrics if checked
        if (metricsCheckbox && metricsCheckbox.checked) {
          this.handleMetrics();
        }

        // Handle dependencies if checked
        if (depsCheckbox && depsCheckbox.checked) {
          this.handleDependencies();
        }
      }
    });

    // Assemble the modal
    inputContainer.appendChild(label);
    inputContainer.appendChild(input);
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
