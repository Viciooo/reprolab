import { createSection } from '../utils';
import { INotebookTracker } from '@jupyterlab/notebook';
import { JupyterFrontEnd } from '@jupyterlab/application';

// Constants
const EXPERIMENT_OPTIONS = {
  CREATE_BUTTON_ID: 'reprolab-create-experiment-btn'
} as const;

const CELL_CONTENT = {
  START_EXPERIMENT: `from reprolab.experiment import start_experiment, end_experiment
start_experiment()`,
  END_EXPERIMENT: 'end_experiment()'
} as const;

export class ExperimentSection {
  private readonly notebooks: INotebookTracker | undefined;
  private readonly app: JupyterFrontEnd;

  constructor(app: JupyterFrontEnd, notebooks?: INotebookTracker) {
    this.app = app;
    this.notebooks = notebooks;
  }

  render(): string {
    const experimentContent = this.createExperimentContent();
    const section = createSection('Create experiment', experimentContent.innerHTML);
    return section.outerHTML;
  }

  private createExperimentContent(): HTMLElement {
    const container = document.createElement('div');
    
    // Description
    container.innerHTML = this.getDescriptionText();
    
    // Create experiment button
    const createButton = this.createExperimentButton();
    container.appendChild(createButton);
    
    return container;
  }

  private getDescriptionText(): string {
    return '<p>For reproducible experiments its crucial to preserve exact immutable snapshot of software. Creating experiments using ReproLab executes your notebook code top to bottom and saves the end result under git tag.</p>';
  }

  private createExperimentButton(): HTMLElement {
    const button = document.createElement('button');
    button.className = 'reprolab-button';
    button.textContent = 'Create experiment';
    button.id = EXPERIMENT_OPTIONS.CREATE_BUTTON_ID;
    
    return button;
  }

  public async createExperiment(): Promise<void> {
    if (!this.validateNotebookContext()) {
      return;
    }

    try {
      await this.saveNotebookState();
      await this.addExperimentCells();
      await this.executeExperiment();
      
      console.log('[ReproLab] Experiment completed successfully');
    } catch (error) {
      console.error('[ReproLab] Error creating experiment:', error);
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

  private async saveNotebookState(): Promise<void> {
    console.log('[ReproLab] Saving notebook before experiment...');
    await this.app.commands.execute('docmanager:save-all');
    await this.delay(500);
  }

  private async addExperimentCells(): Promise<void> {
    const notebook = this.notebooks!.currentWidget!.content;
    const originalCellCount = notebook.model!.cells.length;
    
    console.log(`[ReproLab] Original notebook has ${originalCellCount} cells`);

    await this.addStartExperimentCell(notebook);
    await this.addEndExperimentCell(notebook);

    console.log(`[ReproLab] Notebook now has ${notebook.model!.cells.length} cells`);
  }

  private async addStartExperimentCell(notebook: any): Promise<void> {
    notebook.activeCellIndex = 0;
    this.app.commands.execute('notebook:insert-cell-above');
    await this.delay(100);
    
    const startCell = notebook.model!.cells.get(0);
    if (startCell) {
      startCell.sharedModel.setSource(CELL_CONTENT.START_EXPERIMENT);
      console.log('[ReproLab] Added start_experiment cell');
    }
  }

  private async addEndExperimentCell(notebook: any): Promise<void> {
    notebook.activeCellIndex = notebook.model!.cells.length - 1;
    this.app.commands.execute('notebook:insert-cell-below');
    await this.delay(100);
    
    const endCell = notebook.model!.cells.get(notebook.model!.cells.length - 1);
    if (endCell) {
      endCell.sharedModel.setSource(CELL_CONTENT.END_EXPERIMENT);
      console.log('[ReproLab] Added end_experiment cell');
    }
  }

  private async executeExperiment(): Promise<void> {
    console.log('[ReproLab] Running all cells...');
    await this.app.commands.execute('notebook:run-all-cells');
    await this.delay(2000);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
