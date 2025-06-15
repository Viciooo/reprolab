import { createSection } from '../utils';

const CHECKLIST_FILE = 'reproducibility_checklist';
const DEFAULT_CHECKLIST = [
  'All code and data are version controlled',
  'Environment is specified (e.g., requirements.txt, environment.yml)',
  'Random seeds are set for reproducibility',
  'Results can be regenerated with a single command',
  'Documentation is provided for all steps',
  'Notebooks/scripts are cleaned and annotated',
  'External data sources are referenced and accessible'
];

export class ChecklistSection {
  private checklist: string[];
  private checked: Record<string, boolean>;

  constructor() {
    this.checklist = DEFAULT_CHECKLIST;
    this.checked = {};
    this.checklist.forEach(item => { this.checked[item] = false; });
  }

  render(): string {
    const checklistContent = `
      <ul>
        ${this.checklist.map(item => `
          <li>
            <label>
              <input type="checkbox" data-item="${encodeURIComponent(item)}" ${this.checked[item] ? 'checked' : ''} />
              ${item}
            </label>
          </li>
        `).join('')}
      </ul>
    `;
    const section = createSection('Reproducibility Checklist', checklistContent);
    return section.outerHTML;
  }

  handleCheckboxChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const item = decodeURIComponent(target.getAttribute('data-item') || '');
    this.checked[item] = target.checked;
    this.saveChecklistState();
  }

  async loadChecklistState() {
    try {
      const response = await fetch(`/api/contents/${CHECKLIST_FILE}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.content) {
          const parsed = JSON.parse(data.content);
          if (typeof parsed === 'object' && parsed !== null) {
            // Only keep keys that are in the current checklist
            this.checked = {};
            this.checklist.forEach(item => {
              this.checked[item] = !!parsed[item];
            });
          }
        }
      } else if (response.status === 404) {
        // File does not exist, create it with all unchecked
        this.checked = {};
        this.checklist.forEach(item => { this.checked[item] = false; });
        await this.saveChecklistState();
      }
    } catch (e) {
      // Could not load or parse, fallback to all unchecked
      this.checked = {};
      this.checklist.forEach(item => { this.checked[item] = false; });
      await this.saveChecklistState();
    }
  }

  async saveChecklistState() {
    try {
      const xsrfToken = document.cookie.split('; ').find(row => row.startsWith('_xsrf='))?.split('=')[1];
      await fetch(`/api/contents/${CHECKLIST_FILE}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(xsrfToken ? { 'X-XSRFToken': xsrfToken } : {})
        },
        body: JSON.stringify({
          type: 'file',
          format: 'text',
          content: JSON.stringify(this.checked)
        })
      });
    } catch (e) {
      // Could not save
    }
  }

  getChecklist(): string[] {
    return this.checklist;
  }

  getChecked(): Record<string, boolean> {
    return this.checked;
  }
} 
