import { createSection } from '../utils';
import { INotebookTracker } from '@jupyterlab/notebook';
import { JupyterFrontEnd } from '@jupyterlab/application';

// Constants
const ENVIRONMENT_OPTIONS = {
  CREATE_BUTTON_ID: 'reprolab-create-environment-btn',
  FREEZE_DEPS_BUTTON_ID: 'reprolab-freeze-deps-btn'
} as const;

const CELL_CONTENT = {
  ENVIRONMENT_SETUP: `from reprolab.environment import create_new_venv
create_new_venv('.my_venv')`,
  FREEZE_DEPS: `from reprolab.environment import freeze_venv_dependencies
freeze_venv_dependencies('.my_venv')`
} as const;

export class EnvironmentSection {
  private readonly notebooks: INotebookTracker | undefined;
  private readonly app: JupyterFrontEnd;

  constructor(app: JupyterFrontEnd, notebooks?: INotebookTracker) {
    this.app = app;
    this.notebooks = notebooks;
  }

  render(): string {
    const environmentContent = this.createEnvironmentContent();
    const section = createSection('Create reproducible environment', environmentContent.innerHTML);
    return section.outerHTML;
  }

  private createEnvironmentContent(): HTMLElement {
    const container = document.createElement('div');
    
    // Description
    container.innerHTML = this.getDescriptionText();
    
    // Create environment button
    const createButton = this.createEnvironmentButton();
    container.appendChild(createButton);
    
    // Add some spacing
    const spacer = document.createElement('div');
    spacer.style.marginTop = '10px';
    container.appendChild(spacer);
    
    // Dependency freeze description
    const freezeDescription = document.createElement('div');
    freezeDescription.innerHTML = this.getFreezeDescriptionText();
    freezeDescription.style.marginBottom = '10px';
    container.appendChild(freezeDescription);
    
    // Freeze dependencies button
    const freezeButton = this.createFreezeDepsButton();
    container.appendChild(freezeButton);
    
    return container;
  }

  private getDescriptionText(): string {
    return '<p>Using virtual environments and pinning exact versions of dependencies used is crucial for others to be able to reproduce your work.</p><p><strong>Important:</strong> Remove created cell after creating virtual environment.</p>';
  }

  private getFreezeDescriptionText(): string {
    return '<p>Freeze the versions of packages used and save them to requirements.txt for reproducible environments.</p><p><strong>Important:</strong> Keep the dependency freeze as the last cell.</p>';
  }

  private createEnvironmentButton(): HTMLElement {
    const button = document.createElement('button');
    button.className = 'reprolab-button';
    button.textContent = 'Create virtual env';
    button.id = ENVIRONMENT_OPTIONS.CREATE_BUTTON_ID;
    
    return button;
  }

  private createFreezeDepsButton(): HTMLElement {
    const button = document.createElement('button');
    button.className = 'reprolab-button';
    button.textContent = 'Add dependency freeze cell';
    button.id = ENVIRONMENT_OPTIONS.FREEZE_DEPS_BUTTON_ID;
    
    return button;
  }

  public async createEnvironment(): Promise<void> {
    if (!this.validateNotebookContext()) {
      return;
    }

    try {
      await this.addEnvironmentCell();
      await this.executeEnvironmentCell();
      
      console.log('[ReproLab] Environment setup completed successfully');
    } catch (error) {
      console.error('[ReproLab] Error creating environment:', error);
    }
  }

  public async addFreezeDepsCell(): Promise<void> {
    if (!this.validateNotebookContext()) {
      return;
    }

    try {
      await this.addFreezeDepsCellToNotebook();
      
      console.log('[ReproLab] Dependency freeze cell added successfully');
    } catch (error) {
      console.error('[ReproLab] Error adding dependency freeze cell:', error);
    }
  }

  private validateNotebookContext(): boolean {
    if (!this.notebooks?.currentWidget) {
      console.error('[ReproLab] No active notebook found');
      return false;
    }

    if (!this.notebooks.currentWidget.content.model) {
      console.error('[ReproLab] No notebook model found');
      return false;
    }

    return true;
  }

  private async addEnvironmentCell(): Promise<void> {
    const notebook = this.notebooks!.currentWidget!.content;
    
    console.log('[ReproLab] Adding environment setup cell...');

    // Add cell at the top of the notebook
    notebook.activeCellIndex = 0;
    this.app.commands.execute('notebook:insert-cell-above');
    await this.delay(100);
    
    const environmentCell = notebook.model!.cells.get(0);
    if (environmentCell) {
      environmentCell.sharedModel.setSource(CELL_CONTENT.ENVIRONMENT_SETUP);
      console.log('[ReproLab] Added environment setup cell');
    }
  }

  private async executeEnvironmentCell(): Promise<void> {
    console.log('[ReproLab] Executing environment setup cell...');
    
    // Set the first cell as active and execute it
    const notebook = this.notebooks!.currentWidget!.content;
    notebook.activeCellIndex = 0;
    await this.app.commands.execute('notebook:run-cell');
    await this.delay(2000);
  }

  private async addFreezeDepsCellToNotebook(): Promise<void> {
    const notebook = this.notebooks!.currentWidget!.content;
    
    console.log('[ReproLab] Adding dependency freeze cell...');

    // Add cell at the bottom of the notebook
    const cellCount = notebook.model!.cells.length;
    notebook.activeCellIndex = cellCount;
    this.app.commands.execute('notebook:insert-cell-below');
    await this.delay(100);
    
    const freezeCell = notebook.model!.cells.get(cellCount);
    if (freezeCell) {
      freezeCell.sharedModel.setSource(CELL_CONTENT.FREEZE_DEPS);
      console.log('[ReproLab] Added dependency freeze cell');
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 
