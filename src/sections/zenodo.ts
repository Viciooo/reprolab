import { createSection, createButton } from '../utils';

export class ZenodoSection {
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
}
