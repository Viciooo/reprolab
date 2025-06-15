import { createSection, createButton } from '../utils';
import { INotebookTracker } from '@jupyterlab/notebook';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { getXsrfToken } from '../utils';

export class DependenciesSection {
  private notebooks: INotebookTracker | undefined;
  private app: JupyterFrontEnd;

  constructor(app: JupyterFrontEnd, notebooks?: INotebookTracker) {
    this.app = app;
    this.notebooks = notebooks;
  }

  render(): string {
    const depsContent = document.createElement('div');
    depsContent.appendChild(createButton('reprolab-gather-deps', 'Do it'));
    const section = createSection('Gather and pin dependencies', depsContent.innerHTML);
    return section.outerHTML;
  }

  handleDependenciesButton(): void {
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
