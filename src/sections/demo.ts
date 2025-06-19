import { createSection, createButton } from '../utils';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { INotebookTracker } from '@jupyterlab/notebook';

export class DemoSection {
  private app: JupyterFrontEnd;
  private notebooks: INotebookTracker | undefined;

  constructor(app: JupyterFrontEnd, notebooks?: INotebookTracker) {
    this.app = app;
    this.notebooks = notebooks;
  }

  render(): string {
    const demoContent = document.createElement('div');
    demoContent.innerHTML =
      '<p>Press the button below to add a demo cell to the top of the active notebook. The cell will display the ReproLab documentation.</p>';
    demoContent.appendChild(createButton('reprolab-demo-btn', 'Add Demo Cell'));
    const section = createSection('Demo', demoContent.innerHTML);
    return section.outerHTML;
  }

  async handleDemoButton() {
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
          try {
            // Read the demo.md file using JupyterLab's file system API
            const contents = this.app.serviceManager.contents;
            const model = await contents.get('reprolab_data/demo.md');
            const markdownContent = model.content as string;

            cell.sharedModel.setSource(markdownContent);
            // Change cell type to markdown
            this.app.commands.execute('notebook:change-cell-to-markdown');
            // Render all markdown cells to ensure proper display
            this.app.commands.execute('notebook:render-all-markdown');
          } catch (error) {
            console.error('Error reading demo.md file:', error);
          }
        }
      }
    }
  }
}
