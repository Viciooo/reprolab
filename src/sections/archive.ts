import { createSection, createButton, createInput } from '../utils';

export class ArchiveSection {
  render(): string {
    const archiveContent = document.createElement('div');
    archiveContent.innerHTML = '<p>Currently supports s3 and minio</p>';
    const archiveInputs = document.createElement('div');
    archiveInputs.className = 'reprolab-archive-inputs';
    
    archiveInputs.appendChild(createInput('reprolab-archive-input1', 'password', 'Access Key'));
    archiveInputs.appendChild(createInput('reprolab-archive-input2', 'password', 'Secret Key'));
    archiveInputs.appendChild(createInput('reprolab-archive-input3', 'text', 'Endpoint URL'));
    archiveInputs.appendChild(createButton('reprolab-archive-save', 'Save'));
    
    archiveContent.appendChild(archiveInputs);
    const section = createSection('Archiving data', archiveContent.innerHTML);
    return section.outerHTML;
  }

  handleSaveButton(node: HTMLElement) {
    const accessKey = (node.querySelector('#reprolab-archive-input1') as HTMLInputElement)?.value || '';
    const secretKey = (node.querySelector('#reprolab-archive-input2') as HTMLInputElement)?.value || '';
    const endpointUrl = (node.querySelector('#reprolab-archive-input3') as HTMLInputElement)?.value || '';
    console.log('[ReproLab Archive Save]', { accessKey, secretKey, endpointUrl });
  }
}
