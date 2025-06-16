import { createSection, createButton } from '../utils';

export class ExperimentSection {
  private modal: HTMLElement | null = null;

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

    // Create experiment button
    const createButton = document.createElement('button');
    createButton.className = 'reprolab-button';
    createButton.textContent = 'Create experiment';
    createButton.addEventListener('click', () => {
      const tagInput = document.querySelector('#reprolab-experiment-tag') as HTMLInputElement;
      if (tagInput) {
        console.log(`[ReproLab] Creating experiment with tag: ${tagInput.value}`);
      }
    });

    // Assemble the modal
    inputContainer.appendChild(label);
    inputContainer.appendChild(input);
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
}
