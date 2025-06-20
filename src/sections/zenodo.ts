import { createSection, createButton } from '../utils';

export class ZenodoSection {
  private app: any;
  private notebooks: any;

  constructor(app?: any, notebooks?: any) {
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

  handleTestButton(): void {
    if (!this.notebooks || !this.notebooks.currentWidget) {
      console.error('No active notebook found');
      return;
    }

    const notebook = this.notebooks.currentWidget;
    const model = notebook.model;
    
    if (!model) {
      console.error('No notebook model found');
      return;
    }

    // Create first cell to list git tags
    const listTagsCell = model.contentFactory.createCodeCell({});
    listTagsCell.value.text = `from reprolab.experiment import list_and_sort_git_tags
list_and_sort_git_tags()
# Pick your git tag, to download the reproducability package`;

    // Create second cell for downloading the package
    const downloadCell = model.contentFactory.createCodeCell({});
    downloadCell.value.text = `from reprolab.experiment import download_reproducability_package
download_reproducability_package('<git_tag>')`;

    // Add cells to the end of the notebook
    model.cells.push(listTagsCell);
    model.cells.push(downloadCell);

    // Execute the first cell
    notebook.sessionContext.ready.then(() => {
      notebook.executeCell(listTagsCell);
    });

    console.log('[ZenodoSection] Added reproducibility package download cells to notebook');
  }
}
