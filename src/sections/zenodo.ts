import { createSection, createButton } from '../utils';
import { INotebookTracker } from '@jupyterlab/notebook';
import { JupyterFrontEnd } from '@jupyterlab/application';

export class ZenodoSection {
  private notebooks: INotebookTracker | undefined;
  private app: JupyterFrontEnd;

  constructor(app: JupyterFrontEnd, notebooks?: INotebookTracker) {
    this.app = app;
    this.notebooks = notebooks;
  }

  render(): string {
    const zenodoContent = document.createElement('div');
    zenodoContent.innerHTML = '<p>You can in a few steps download the raw datasets and save the snapshots of software to the Zenodo for archiving</p>';
    zenodoContent.appendChild(createButton('reprolab-zenodo-more', 'See more'));
    const section = createSection('Publishing software and data to Zenodo', zenodoContent.innerHTML);
    return section.outerHTML;
  }

  handleZenodoButton(modal: HTMLElement): void {
    modal.style.display = 'flex';
  }

  async handleTestButton(): Promise<void> {
    if (!this.validateNotebookContext()) {
      return;
    }

    try {
      await this.addReproducabilityCells();
      await this.executeFirstCell();
      
      console.log('[ReproLab] Reproducability package cells added successfully');
    } catch (error) {
      console.error('[ReproLab] Error adding reproducability cells:', error);
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

  private async addReproducabilityCells(): Promise<void> {
    const notebook = this.notebooks!.currentWidget!.content;
    
    console.log('[ReproLab] Adding reproducability package cells...');

    // Add first cell at the bottom of the notebook
    const cellCount = notebook.model!.cells.length;
    notebook.activeCellIndex = cellCount;
    this.app.commands.execute('notebook:insert-cell-below');
    await this.delay(100);
    
    const listTagsCell = notebook.model!.cells.get(cellCount);
    if (listTagsCell) {
      listTagsCell.sharedModel.setSource(`from reprolab.experiment import list_and_sort_git_tags
list_and_sort_git_tags()
# Pick your git tag, to download the reproducability package`);
      console.log('[ReproLab] Added git tags listing cell');
    }

    // Add second cell
    notebook.activeCellIndex = cellCount + 1;
    this.app.commands.execute('notebook:insert-cell-below');
    await this.delay(100);
    
    const downloadCell = notebook.model!.cells.get(cellCount + 1);
    if (downloadCell) {
      downloadCell.sharedModel.setSource(`from reprolab.experiment import download_reproducability_package
download_reproducability_package('<git_tag>')`);
      console.log('[ReproLab] Added download package cell');
    }
  }

  private async executeFirstCell(): Promise<void> {
    console.log('[ReproLab] Executing git tags listing cell...');
    
    const notebook = this.notebooks!.currentWidget!.content;
    const cellCount = notebook.model!.cells.length;
    
    // Set the first new cell as active and execute it
    notebook.activeCellIndex = cellCount - 2; // First of the two new cells
    await this.app.commands.execute('notebook:run-cell');
    await this.delay(2000);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
