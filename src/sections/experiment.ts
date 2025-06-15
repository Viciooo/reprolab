import { createSection, createButton, createInput } from '../utils';

export class ExperimentSection {
  render(): string {
    const experimentContent = document.createElement('div');
    experimentContent.innerHTML = '<p>For reproducible experiments its crucial to preserve exact immutable snapshot of software. Creating experiments using ReproLab executes your notebook code top to bottom and saves the end result under git tag.</p>';
    
    const experimentInput = document.createElement('div');
    experimentInput.className = 'reprolab-experiment-input';
    
    const label = document.createElement('label');
    label.className = 'reprolab-experiment-label';
    label.textContent = 'Suggested tag:';
    label.htmlFor = 'reprolab-experiment-tag';
    
    const input = createInput('reprolab-experiment-tag', 'text', '');
    input.value = 'v1.0.0';
    
    experimentInput.appendChild(label);
    experimentInput.appendChild(input);
    experimentInput.appendChild(createButton('reprolab-create-experiment', 'Create experiment'));
    
    experimentContent.appendChild(experimentInput);
    const section = createSection('Create experiment', experimentContent.innerHTML);
    return section.outerHTML;
  }

  handleCreateExperiment(node: HTMLElement): void {
    const tagInput = node.querySelector('#reprolab-experiment-tag') as HTMLInputElement;
    const tag = tagInput.value;
    console.log(`[ReproLab] Creating experiment with tag: ${tag}`);
  }
}
