import { createSection, createButton } from '../utils';
import { INotebookTracker } from '@jupyterlab/notebook';

export class MetricsSection {
  private notebooks: INotebookTracker | undefined;

  constructor(notebooks?: INotebookTracker) {
    this.notebooks = notebooks;
  }

  render(): string {
    const metricsContent = document.createElement('div');
    metricsContent.appendChild(createButton('reprolab-add-metrics', 'Add Run Metrics'));
    const section = createSection('Run Metrics', metricsContent.innerHTML);
    return section.outerHTML;
  }

  handleMetricsButton(): void {
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
}
