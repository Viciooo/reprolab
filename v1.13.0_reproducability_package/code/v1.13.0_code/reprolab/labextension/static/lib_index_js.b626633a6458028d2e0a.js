"use strict";
(self["webpackChunkreprolab"] = self["webpackChunkreprolab"] || []).push([["lib_index_js"],{

/***/ "./lib/index.js":
/*!**********************!*\
  !*** ./lib/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @jupyterlab/apputils */ "webpack/sharing/consume/default/@jupyterlab/apputils");
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @jupyterlab/ui-components */ "webpack/sharing/consume/default/@jupyterlab/ui-components");
/* harmony import */ var _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _lumino_widgets__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @lumino/widgets */ "webpack/sharing/consume/default/@lumino/widgets");
/* harmony import */ var _lumino_widgets__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_lumino_widgets__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _jupyterlab_notebook__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @jupyterlab/notebook */ "webpack/sharing/consume/default/@jupyterlab/notebook");
/* harmony import */ var _jupyterlab_notebook__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_notebook__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./utils */ "./lib/utils.js");
/* harmony import */ var _sections_checklist__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./sections/checklist */ "./lib/sections/checklist.js");
/* harmony import */ var _sections_demo__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./sections/demo */ "./lib/sections/demo.js");
/* harmony import */ var _sections_archive__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./sections/archive */ "./lib/sections/archive.js");
/* harmony import */ var _sections_zenodo__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./sections/zenodo */ "./lib/sections/zenodo.js");
/* harmony import */ var _sections_experiment__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./sections/experiment */ "./lib/sections/experiment.js");
/* harmony import */ var _sections_environment__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./sections/environment */ "./lib/sections/environment.js");











// Constants
const REPROLAB_CONFIG = {
    ID: 'reprolab-sidebar',
    TITLE: 'ReproLab',
    CAPTION: 'ReproLab Panel',
    COMMAND: 'reprolab:open',
    COMMAND_LABEL: 'Open ReproLab Panel',
    COMMAND_CATEGORY: 'ReproLab'
};
const BUTTON_IDS = {
    DEMO: 'reprolab-demo-btn',
    ARCHIVE_SAVE: 'reprolab-archive-save',
    ZENODO_MORE: 'reprolab-zenodo-more',
    CREATE_EXPERIMENT: 'reprolab-create-experiment-btn',
    CREATE_ENVIRONMENT: 'reprolab-create-environment-btn',
    FREEZE_DEPS: 'reprolab-freeze-deps-btn',
    MODAL_TEST: 'reprolab-modal-test'
};
const CHECKBOX_SELECTOR = 'input[type="checkbox"]';
/** SVG string for the ReproLab icon */
const REPROLAB_ICON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" viewBox="0 0 24 24">
  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="currentColor"/>
</svg>
`;
/** Create the ReproLab icon */
const reprolabIcon = new _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_1__.LabIcon({
    name: 'reprolab:icon',
    svgstr: REPROLAB_ICON_SVG
});
/** The sidebar widget for the ReproLab panel */
class ReprolabSidebarWidget extends _lumino_widgets__WEBPACK_IMPORTED_MODULE_2__.Widget {
    constructor(app, notebooks) {
        super();
        this.app = app;
        this.notebooks = notebooks;
        this.initializeWidget();
        this.initializeSections();
        this.render();
        this.loadChecklistState();
    }
    initializeWidget() {
        this.id = REPROLAB_CONFIG.ID;
        this.addClass('jp-SideBar');
        this.addClass('reprolab-sidebar');
        this.title.icon = reprolabIcon;
        this.title.label = REPROLAB_CONFIG.TITLE;
        this.title.caption = REPROLAB_CONFIG.CAPTION;
    }
    initializeSections() {
        this.checklistSection = new _sections_checklist__WEBPACK_IMPORTED_MODULE_4__.ChecklistSection();
        this.demoSection = new _sections_demo__WEBPACK_IMPORTED_MODULE_5__.DemoSection(this.app, this.notebooks);
        this.archiveSection = new _sections_archive__WEBPACK_IMPORTED_MODULE_6__.ArchiveSection();
        this.zenodoSection = new _sections_zenodo__WEBPACK_IMPORTED_MODULE_7__.ZenodoSection(this.app, this.notebooks);
        this.experimentSection = new _sections_experiment__WEBPACK_IMPORTED_MODULE_8__.ExperimentSection(this.app, this.notebooks);
        this.environmentSection = new _sections_environment__WEBPACK_IMPORTED_MODULE_9__.EnvironmentSection(this.app, this.notebooks);
    }
    async loadChecklistState() {
        await this.checklistSection.loadChecklistState();
        this.render();
    }
    render() {
        const container = this.createMainContainer();
        const modal = this.createModal();
        this.node.innerHTML = '';
        this.node.appendChild(container);
        document.body.appendChild(modal);
        this.setupEventListeners(modal);
    }
    createMainContainer() {
        const container = document.createElement('div');
        // Header section
        const header = this.createHeader();
        container.appendChild(header);
        // Sections
        const sections = [
            this.demoSection.render(),
            this.checklistSection.render(),
            this.environmentSection.render(),
            this.experimentSection.render(),
            this.archiveSection.render(),
            this.zenodoSection.render()
        ];
        sections.forEach(sectionHtml => {
            const fragment = document.createRange().createContextualFragment(sectionHtml);
            container.appendChild(fragment);
        });
        return container;
    }
    createHeader() {
        const header = document.createElement('div');
        header.className = 'reprolab-header';
        header.innerHTML = `
      <h1>ReproLab</h1>
      <h3>One step closer to accessible reproducible research</h3>
    `;
        return header;
    }
    createModal() {
        const modal = document.createElement('div');
        modal.className = 'reprolab-modal';
        const modalContent = document.createElement('div');
        modalContent.className = 'reprolab-modal-content';
        const closeButton = document.createElement('span');
        closeButton.className = 'reprolab-modal-close';
        closeButton.textContent = '×';
        const modalText = document.createElement('div');
        modalText.innerHTML = `
      <section style="font-size: 16px; line-height: 1.6;">
        <p>
          Clicking the <strong>Create Reproducibility Package</strong> button below will insert and execute a Python code cell that generates a complete reproducibility package—bundling both your data and code.
        </p>
        <p>
          You can share this package with colleagues or publish it on platforms like 
          <a href="https://zenodo.org/" target="_blank" rel="noopener noreferrer" style="color: #0066cc; text-decoration: underline;">Zenodo</a>, which will assign a persistent identifier (DOI) to your work.
        </p>
        <p>
          For detailed instructions on structuring and publishing reproducible research, please consult the official Zenodo guide:  
          <a href="https://doi.org/10.5281/zenodo.11146986" target="_blank" rel="noopener noreferrer" style="color: #0066cc; text-decoration: underline;">
            Make Your Research Reproducible: Practical Guide for Researchers (DOI: 10.5281/zenodo.11146986)
          </a>
        </p>
        <p>
          Additional help can be found in the Zenodo documentation under their "Guide" and "GitHub and Software" sections:  
          <a href="https://help.zenodo.org/docs/" target="_blank" rel="noopener noreferrer" style="color: #0066cc; text-decoration: underline;">Zenodo Guides & Docs</a>
        </p>
      </section>
    `;
        const createPackageButton = (0,_utils__WEBPACK_IMPORTED_MODULE_10__.createButton)(BUTTON_IDS.MODAL_TEST, 'Create Reproducibility Package');
        modalContent.appendChild(closeButton);
        modalContent.appendChild(modalText);
        modalContent.appendChild(createPackageButton);
        modal.appendChild(modalContent);
        return modal;
    }
    setupEventListeners(modal) {
        this.setupButtonListeners();
        this.setupCheckboxListeners();
        this.setupModalListeners(modal);
    }
    setupButtonListeners() {
        // Demo button
        const demoBtn = this.node.querySelector(`#${BUTTON_IDS.DEMO}`);
        if (demoBtn) {
            demoBtn.addEventListener('click', () => this.demoSection.handleDemoButton());
        }
        // Archive save button
        const saveBtn = this.node.querySelector(`#${BUTTON_IDS.ARCHIVE_SAVE}`);
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.archiveSection.handleSaveButton(this.node));
        }
        // Zenodo button
        const zenodoBtn = this.node.querySelector(`#${BUTTON_IDS.ZENODO_MORE}`);
        if (zenodoBtn) {
            zenodoBtn.addEventListener('click', () => {
                const modal = document.querySelector('.reprolab-modal');
                if (modal) {
                    this.zenodoSection.handleZenodoButton(modal);
                }
            });
        }
        // Create experiment button
        const createExperimentBtn = this.node.querySelector(`#${BUTTON_IDS.CREATE_EXPERIMENT}`);
        if (createExperimentBtn) {
            createExperimentBtn.addEventListener('click', () => this.handleCreateExperiment());
        }
        // Create environment button
        const createEnvironmentBtn = this.node.querySelector(`#${BUTTON_IDS.CREATE_ENVIRONMENT}`);
        if (createEnvironmentBtn) {
            createEnvironmentBtn.addEventListener('click', () => this.handleCreateEnvironment());
        }
        // Freeze dependencies button
        const freezeDepsBtn = this.node.querySelector(`#${BUTTON_IDS.FREEZE_DEPS}`);
        if (freezeDepsBtn) {
            freezeDepsBtn.addEventListener('click', () => this.handleFreezeDependencies());
        }
    }
    setupCheckboxListeners() {
        this.node.querySelectorAll(CHECKBOX_SELECTOR).forEach(cb => {
            cb.addEventListener('change', (event) => this.checklistSection.handleCheckboxChange(event));
        });
    }
    setupModalListeners(modal) {
        // Modal close button
        const closeBtn = modal.querySelector('.reprolab-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        // Modal test button
        const modalTestBtn = modal.querySelector(`#${BUTTON_IDS.MODAL_TEST}`);
        if (modalTestBtn) {
            modalTestBtn.addEventListener('click', () => {
                console.log('Create Reproducibility Package button clicked');
                this.zenodoSection.handleTestButton();
                modal.style.display = 'none';
            });
        }
        // Close modal when clicking outside
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    handleCreateExperiment() {
        console.log('[ReproLab] Creating experiment...');
        // Create the experiment
        this.experimentSection.createExperiment();
    }
    handleCreateEnvironment() {
        console.log('[ReproLab] Creating environment...');
        // Create the environment
        this.environmentSection.createEnvironment();
    }
    handleFreezeDependencies() {
        console.log('[ReproLab] Freezing dependencies...');
        // Add dependency freeze cell
        this.environmentSection.addFreezeDepsCell();
    }
}
/** Activate the extension */
function activateReprolab(app, palette, notebooks) {
    console.log('JupyterLab extension reprolab is activated!');
    // Add command to open the sidebar panel
    app.commands.addCommand(REPROLAB_CONFIG.COMMAND, {
        label: REPROLAB_CONFIG.COMMAND_LABEL,
        icon: reprolabIcon,
        execute: () => {
            app.shell.activateById(REPROLAB_CONFIG.ID);
        }
    });
    // Add the command to the command palette
    palette.addItem({
        command: REPROLAB_CONFIG.COMMAND,
        category: REPROLAB_CONFIG.COMMAND_CATEGORY
    });
    // Add the sidebar widget (only once)
    const sidebarWidget = new ReprolabSidebarWidget(app, notebooks);
    app.shell.add(sidebarWidget, 'left', { rank: 100 });
}
/**
 * Initialization data for the reprolab extension.
 */
const plugin = {
    id: 'reprolab:plugin',
    description: 'One step closer reproducible research',
    autoStart: true,
    requires: [_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__.ICommandPalette, _jupyterlab_notebook__WEBPACK_IMPORTED_MODULE_3__.INotebookTracker],
    activate: activateReprolab
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (plugin);


/***/ }),

/***/ "./lib/sections/archive.js":
/*!*********************************!*\
  !*** ./lib/sections/archive.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ArchiveSection: () => (/* binding */ ArchiveSection)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./lib/utils.js");

// Use a relative path to ensure it's created in the current workspace
const AWS_ENV_FILE = 'reprolab_data/aws_env.json';
class ArchiveSection {
    constructor() {
        this.accessKey = '';
        this.secretKey = '';
        this.bucketName = '';
        this.initialized = false;
        this.initialize();
    }
    async initialize() {
        console.log('[ReproLab Archive] Initializing...');
        await this.loadAWSEnv();
        this.initialized = true;
        console.log('[ReproLab Archive] Initialized with values:', {
            accessKey: this.accessKey ? '***' : '',
            secretKey: this.secretKey ? '***' : '',
            bucketName: this.bucketName
        });
    }
    render() {
        if (!this.initialized) {
            console.log('[ReproLab Archive] Not yet initialized, rendering with empty values');
        }
        const archiveContent = `
      <p>Configure AWS S3 credentials for data archiving</p>
      <div class="reprolab-archive-inputs">
        <input id="reprolab-archive-input1" type="password" class="reprolab-input" placeholder="Access Key" value="${this.accessKey}">
        <input id="reprolab-archive-input2" type="password" class="reprolab-input" placeholder="Secret Key" value="${this.secretKey}">
        <input id="reprolab-archive-input3" type="text" class="reprolab-input" placeholder="Bucket Name" value="${this.bucketName}">
        <button id="reprolab-archive-save" class="reprolab-button">Save</button>
      </div>
    `;
        const section = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.createSection)('AWS S3 Configuration', archiveContent);
        return section.outerHTML;
    }
    async handleSaveButton(node) {
        var _a, _b, _c;
        const accessKey = ((_a = node.querySelector('#reprolab-archive-input1')) === null || _a === void 0 ? void 0 : _a.value) || '';
        const secretKey = ((_b = node.querySelector('#reprolab-archive-input2')) === null || _b === void 0 ? void 0 : _b.value) || '';
        const bucketName = ((_c = node.querySelector('#reprolab-archive-input3')) === null || _c === void 0 ? void 0 : _c.value) || '';
        this.accessKey = accessKey;
        this.secretKey = secretKey;
        this.bucketName = bucketName;
        await this.saveAWSEnv();
        console.log('[ReproLab Archive Save]', {
            accessKey: accessKey ? '***' : '',
            secretKey: secretKey ? '***' : '',
            bucketName
        });
    }
    async loadAWSEnv() {
        console.log('[ReproLab Archive] Loading AWS environment...');
        try {
            const response = await fetch(`/api/contents/${AWS_ENV_FILE}`);
            console.log('[ReproLab Archive] Fetch response status:', response.status);
            if (response.ok) {
                const data = await response.json();
                console.log('[ReproLab Archive] Received data:', data ? 'success' : 'empty');
                if (data && data.content) {
                    const parsed = JSON.parse(data.content);
                    console.log('[ReproLab Archive] Parsed content:', parsed ? 'success' : 'failed');
                    if (typeof parsed === 'object' && parsed !== null) {
                        this.accessKey = parsed.AWS_ACCESS_KEY_ID || '';
                        this.secretKey = parsed.AWS_SECRET_ACCESS_KEY || '';
                        this.bucketName = parsed.AWS_BUCKET || '';
                        console.log('[ReproLab Archive] Loaded values:', {
                            accessKey: this.accessKey ? '***' : '',
                            secretKey: this.secretKey ? '***' : '',
                            bucketName: this.bucketName
                        });
                    }
                }
            }
            else if (response.status === 404) {
                console.log('[ReproLab Archive] File not found, creating with empty values');
                // File does not exist, create it with empty values
                this.accessKey = '';
                this.secretKey = '';
                this.bucketName = '';
                await this.saveAWSEnv();
            }
        }
        catch (e) {
            console.error('[ReproLab Archive] Could not load AWS environment variables:', e);
            // If there's an error, initialize with empty values
            this.accessKey = '';
            this.secretKey = '';
            this.bucketName = '';
            await this.saveAWSEnv();
        }
    }
    async saveAWSEnv() {
        console.log('[ReproLab Archive] Saving AWS environment...');
        try {
            const xsrfToken = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.getXsrfToken)();
            const response = await fetch(`/api/contents/${AWS_ENV_FILE}`, {
                method: 'PUT',
                headers: Object.assign({ 'Content-Type': 'application/json' }, (xsrfToken ? { 'X-XSRFToken': xsrfToken } : {})),
                body: JSON.stringify({
                    type: 'file',
                    format: 'text',
                    content: JSON.stringify({
                        AWS_ACCESS_KEY_ID: this.accessKey,
                        AWS_SECRET_ACCESS_KEY: this.secretKey,
                        AWS_BUCKET: this.bucketName
                    })
                })
            });
            console.log('[ReproLab Archive] Save response status:', response.status);
        }
        catch (e) {
            console.error('[ReproLab Archive] Could not save AWS environment variables:', e);
        }
    }
}


/***/ }),

/***/ "./lib/sections/checklist.js":
/*!***********************************!*\
  !*** ./lib/sections/checklist.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ChecklistSection: () => (/* binding */ ChecklistSection)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./lib/utils.js");

const CHECKLIST_FILE = 'reprolab_data/reproducibility_checklist.json';
const DEFAULT_CHECKLIST = [
    "Notebook contains clear narrative text explaining analysis steps.",
    "All software dependencies are specified with pinned versions.",
    "Project is under version control (e.g., Git) in a public repository.",
    "Notebook can be run end-to-end without manual steps.",
    "All input data are available or easily accessible.",
    "Project includes clear usage and interpretation instructions."
];
class ChecklistSection {
    constructor() {
        this.checklist = DEFAULT_CHECKLIST;
        this.checked = {};
        this.checklist.forEach(item => { this.checked[item] = false; });
    }
    render() {
        const checklistContent = `
      <ul style="list-style: none; padding-left: 0;">
        ${this.checklist
            .map(item => `
          <li>
            <label>
              <input type="checkbox" data-item="${encodeURIComponent(item)}" ${this.checked[item] ? 'checked' : ''} />
              ${item}
            </label>
          </li>
        `)
            .join('')}
      </ul>
    `;
        const section = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.createSection)('Reproducibility Checklist', checklistContent);
        return section.outerHTML;
    }
    handleCheckboxChange(event) {
        const target = event.target;
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
            }
            else if (response.status === 404) {
                // File does not exist, create it with all unchecked
                this.checked = {};
                this.checklist.forEach(item => { this.checked[item] = false; });
                await this.saveChecklistState();
            }
        }
        catch (e) {
            // Could not load or parse, fallback to all unchecked
            this.checked = {};
            this.checklist.forEach(item => { this.checked[item] = false; });
            await this.saveChecklistState();
        }
    }
    async saveChecklistState() {
        try {
            const xsrfToken = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.getXsrfToken)();
            await fetch(`/api/contents/${CHECKLIST_FILE}`, {
                method: 'PUT',
                headers: Object.assign({ 'Content-Type': 'application/json' }, (xsrfToken ? { 'X-XSRFToken': xsrfToken } : {})),
                body: JSON.stringify({
                    type: 'file',
                    format: 'text',
                    content: JSON.stringify(this.checked)
                })
            });
        }
        catch (e) {
            // Could not save
        }
    }
    getChecklist() {
        return this.checklist;
    }
    getChecked() {
        return this.checked;
    }
}


/***/ }),

/***/ "./lib/sections/demo.js":
/*!******************************!*\
  !*** ./lib/sections/demo.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DemoSection: () => (/* binding */ DemoSection)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./lib/utils.js");

// Demo content stored as a variable instead of reading from file
const DEMO_CONTENT = `# ReproLab Demo

Welcome to ReproLab! This extension helps you make your research more reproducible.

## Features

- **Create Experiments**: Automatically save immutable snapshots of your code under \`git\` tags to preserve the **exact code and outputs**
- **Manage Dependencies**: Automatically gather and pin **exact package versions**, so that others can set up your environment with one command
- **Cache Data**: Call external API/load manually dataset only once, caching function will handle the rest
- **Archive Data**: Caching function can also preserve the compressed data in *AWS S3*, so you always know what data was used and reduce the API calls
- **Publishing guide**: The reproducibility checklist & automated generation of reproducability package make publishing to platforms such as Zenodo very easy

## Getting Started

1. Use the sidebar to view ReproLab features
2. Create virtual environment and pin your dependencies, go to reprolab section \`Create reproducible environment\` 
3. Create an experiment to save your current state, go to reprolab section \`Create experiment\`
4. Archive your data for long-term storage, go to reprolab section \`Demo\` and play around with it.
5. Publish your work when ready, remember to use reproducability checklist from the section \`Reproducibility Checklist\`

## Example Usage of persistio decorator

To cache and archive the datasets you use, both from local files and APIs we developed a simple decorator that put over your function that gets the datasets caches the file both locally and in the cloud so that the dataset you use is archived and the number of calls to external APIs is minimal and you don't need to keep the file around after you run it once.

Here is an example using one of NASA open APIs. If you want to test it out yourself, you can copy the code, but you need to provide bucket name and access and secret key in the left-hand panel using the \`AWS S3 Configuration\` section.

\`\`\`python
import requests
import pandas as pd
from io import StringIO

# The two lines below is all that you need to add
from reprolab.experiment import persistio
@persistio()
def get_exoplanets_data_from_nasa():
    url = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync"

    query = """
    SELECT TOP 10
        pl_name AS planet_name,
        hostname AS host_star,
        pl_orbper AS orbital_period_days,
        pl_rade AS planet_radius_earth,
        disc_year AS discovery_year
    FROM
        ps
    WHERE
        default_flag = 1
    """

    params = {
        "query": query,
        "format": "csv"
    }

    response = requests.get(url, params=params)

    if response.status_code == 200:
        df = pd.read_csv(StringIO(response.text))
        
        print(df)
        
    else:
        print(f"Error: {response.status_code} - {response.text}")
    return df

exoplanets_data = get_exoplanets_data_from_nasa()
\`\`\`

If you run this cell twice you will notice from the logs that the second time file was read from the compressed file in the cache. If you were to lose access to local cache (e.g. by pulling the repository using different device) \`persistio\` would fetch the data from the cloud archive.


For more information, visit our [documentation](https://github.com/your-repo/reprolab).`;
class DemoSection {
    constructor(app, notebooks) {
        this.app = app;
        this.notebooks = notebooks;
    }
    render() {
        const demoContent = document.createElement('div');
        demoContent.innerHTML =
            '<p>Press the button below to add a demo cell to the top of the active notebook. The cell will display the ReproLab documentation.</p>';
        demoContent.appendChild((0,_utils__WEBPACK_IMPORTED_MODULE_0__.createButton)('reprolab-demo-btn', 'Add Demo Cell'));
        const section = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.createSection)('Demo', demoContent.innerHTML);
        return section.outerHTML;
    }
    async handleDemoButton() {
        if (this.notebooks && this.notebooks.currentWidget) {
            const notebook = this.notebooks.currentWidget.content;
            if (notebook.model && notebook.model.cells.length > 0) {
                notebook.activeCellIndex = 0;
            }
            else {
                this.app.commands.execute('notebook:insert-cell-below');
                notebook.activeCellIndex = 0;
            }
            this.app.commands.execute('notebook:insert-cell-above');
            if (notebook.model && notebook.model.cells.length > 0) {
                const cell = notebook.model.cells.get(0);
                if (cell) {
                    try {
                        // Use the hardcoded demo content instead of reading from file
                        cell.sharedModel.setSource(DEMO_CONTENT);
                        // Change cell type to markdown
                        this.app.commands.execute('notebook:change-cell-to-markdown');
                        // Render all markdown cells to ensure proper display
                        this.app.commands.execute('notebook:render-all-markdown');
                    }
                    catch (error) {
                        console.error('Error setting demo content:', error);
                    }
                }
            }
        }
    }
}


/***/ }),

/***/ "./lib/sections/environment.js":
/*!*************************************!*\
  !*** ./lib/sections/environment.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EnvironmentSection: () => (/* binding */ EnvironmentSection)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./lib/utils.js");

// Constants
const ENVIRONMENT_OPTIONS = {
    CREATE_BUTTON_ID: 'reprolab-create-environment-btn',
    FREEZE_DEPS_BUTTON_ID: 'reprolab-freeze-deps-btn'
};
const CELL_CONTENT = {
    ENVIRONMENT_SETUP: `from reprolab.environment import create_new_venv
create_new_venv('.my_venv')`,
    FREEZE_DEPS: `from reprolab.environment import freeze_venv_dependencies
freeze_venv_dependencies('.my_venv')`
};
class EnvironmentSection {
    constructor(app, notebooks) {
        this.app = app;
        this.notebooks = notebooks;
    }
    render() {
        const environmentContent = this.createEnvironmentContent();
        const section = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.createSection)('Create reproducible environment', environmentContent.innerHTML);
        return section.outerHTML;
    }
    createEnvironmentContent() {
        const container = document.createElement('div');
        // Description
        container.innerHTML = this.getDescriptionText();
        // Create environment button
        const createButton = this.createEnvironmentButton();
        container.appendChild(createButton);
        // Add some spacing
        const spacer = document.createElement('div');
        spacer.style.marginTop = '10px';
        container.appendChild(spacer);
        // Dependency freeze description
        const freezeDescription = document.createElement('div');
        freezeDescription.innerHTML = this.getFreezeDescriptionText();
        freezeDescription.style.marginBottom = '10px';
        container.appendChild(freezeDescription);
        // Freeze dependencies button
        const freezeButton = this.createFreezeDepsButton();
        container.appendChild(freezeButton);
        return container;
    }
    getDescriptionText() {
        return '<p>Using virtual environments and pinning exact versions of dependencies used is crucial for others to be able to reproduce your work.</p><p><strong>Important:</strong> Remove created cell after creating virtual environment.</p>';
    }
    getFreezeDescriptionText() {
        return '<p>Freeze the versions of packages used and save them to requirements.txt for reproducible environments.</p><p><strong>Important:</strong> Keep the dependency freeze as the last cell.</p>';
    }
    createEnvironmentButton() {
        const button = document.createElement('button');
        button.className = 'reprolab-button';
        button.textContent = 'Create virtual env';
        button.id = ENVIRONMENT_OPTIONS.CREATE_BUTTON_ID;
        return button;
    }
    createFreezeDepsButton() {
        const button = document.createElement('button');
        button.className = 'reprolab-button';
        button.textContent = 'Add dependency freeze cell';
        button.id = ENVIRONMENT_OPTIONS.FREEZE_DEPS_BUTTON_ID;
        return button;
    }
    async createEnvironment() {
        if (!this.validateNotebookContext()) {
            return;
        }
        try {
            await this.addEnvironmentCell();
            await this.executeEnvironmentCell();
            console.log('[ReproLab] Environment setup completed successfully');
        }
        catch (error) {
            console.error('[ReproLab] Error creating environment:', error);
        }
    }
    async addFreezeDepsCell() {
        if (!this.validateNotebookContext()) {
            return;
        }
        try {
            await this.addFreezeDepsCellToNotebook();
            console.log('[ReproLab] Dependency freeze cell added successfully');
        }
        catch (error) {
            console.error('[ReproLab] Error adding dependency freeze cell:', error);
        }
    }
    validateNotebookContext() {
        var _a;
        if (!((_a = this.notebooks) === null || _a === void 0 ? void 0 : _a.currentWidget)) {
            console.error('[ReproLab] No active notebook found');
            return false;
        }
        if (!this.notebooks.currentWidget.content.model) {
            console.error('[ReproLab] No notebook model found');
            return false;
        }
        return true;
    }
    async addEnvironmentCell() {
        const notebook = this.notebooks.currentWidget.content;
        console.log('[ReproLab] Adding environment setup cell...');
        // Add cell at the top of the notebook
        notebook.activeCellIndex = 0;
        this.app.commands.execute('notebook:insert-cell-above');
        await this.delay(100);
        const environmentCell = notebook.model.cells.get(0);
        if (environmentCell) {
            environmentCell.sharedModel.setSource(CELL_CONTENT.ENVIRONMENT_SETUP);
            console.log('[ReproLab] Added environment setup cell');
        }
    }
    async executeEnvironmentCell() {
        console.log('[ReproLab] Executing environment setup cell...');
        // Set the first cell as active and execute it
        const notebook = this.notebooks.currentWidget.content;
        notebook.activeCellIndex = 0;
        await this.app.commands.execute('notebook:run-cell');
        await this.delay(2000);
    }
    async addFreezeDepsCellToNotebook() {
        const notebook = this.notebooks.currentWidget.content;
        console.log('[ReproLab] Adding dependency freeze cell...');
        // Add cell at the bottom of the notebook
        const cellCount = notebook.model.cells.length;
        notebook.activeCellIndex = cellCount;
        this.app.commands.execute('notebook:insert-cell-below');
        await this.delay(100);
        const freezeCell = notebook.model.cells.get(cellCount);
        if (freezeCell) {
            freezeCell.sharedModel.setSource(CELL_CONTENT.FREEZE_DEPS);
            console.log('[ReproLab] Added dependency freeze cell');
        }
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}


/***/ }),

/***/ "./lib/sections/experiment.js":
/*!************************************!*\
  !*** ./lib/sections/experiment.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ExperimentSection: () => (/* binding */ ExperimentSection)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./lib/utils.js");

// Constants
const EXPERIMENT_OPTIONS = {
    CREATE_BUTTON_ID: 'reprolab-create-experiment-btn'
};
const CELL_CONTENT = {
    START_EXPERIMENT: `from reprolab.experiment import start_experiment, end_experiment
start_experiment()`,
    END_EXPERIMENT: 'end_experiment()'
};
class ExperimentSection {
    constructor(app, notebooks) {
        this.app = app;
        this.notebooks = notebooks;
    }
    render() {
        const experimentContent = this.createExperimentContent();
        const section = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.createSection)('Create experiment', experimentContent.innerHTML);
        return section.outerHTML;
    }
    createExperimentContent() {
        const container = document.createElement('div');
        // Description
        container.innerHTML = this.getDescriptionText();
        // Create experiment button
        const createButton = this.createExperimentButton();
        container.appendChild(createButton);
        return container;
    }
    getDescriptionText() {
        return '<p>For reproducible experiments its crucial to preserve exact immutable snapshot of software. Creating experiments using ReproLab executes your notebook code top to bottom and saves the end result under git tag.</p>';
    }
    createExperimentButton() {
        const button = document.createElement('button');
        button.className = 'reprolab-button';
        button.textContent = 'Create experiment';
        button.id = EXPERIMENT_OPTIONS.CREATE_BUTTON_ID;
        return button;
    }
    async createExperiment() {
        if (!this.validateNotebookContext()) {
            return;
        }
        try {
            await this.saveNotebookState();
            await this.addExperimentCells();
            await this.executeExperiment();
            console.log('[ReproLab] Experiment completed successfully');
        }
        catch (error) {
            console.error('[ReproLab] Error creating experiment:', error);
        }
    }
    validateNotebookContext() {
        var _a;
        if (!((_a = this.notebooks) === null || _a === void 0 ? void 0 : _a.currentWidget)) {
            console.error('[ReproLab] No active notebook found');
            return false;
        }
        if (!this.notebooks.currentWidget.content.model) {
            console.error('[ReproLab] No notebook model found');
            return false;
        }
        return true;
    }
    async saveNotebookState() {
        console.log('[ReproLab] Saving notebook before experiment...');
        await this.app.commands.execute('docmanager:save-all');
        await this.delay(500);
    }
    async addExperimentCells() {
        const notebook = this.notebooks.currentWidget.content;
        const originalCellCount = notebook.model.cells.length;
        console.log(`[ReproLab] Original notebook has ${originalCellCount} cells`);
        await this.addStartExperimentCell(notebook);
        await this.addEndExperimentCell(notebook);
        console.log(`[ReproLab] Notebook now has ${notebook.model.cells.length} cells`);
    }
    async addStartExperimentCell(notebook) {
        notebook.activeCellIndex = 0;
        this.app.commands.execute('notebook:insert-cell-above');
        await this.delay(100);
        const startCell = notebook.model.cells.get(0);
        if (startCell) {
            startCell.sharedModel.setSource(CELL_CONTENT.START_EXPERIMENT);
            console.log('[ReproLab] Added start_experiment cell');
        }
    }
    async addEndExperimentCell(notebook) {
        notebook.activeCellIndex = notebook.model.cells.length - 1;
        this.app.commands.execute('notebook:insert-cell-below');
        await this.delay(100);
        const endCell = notebook.model.cells.get(notebook.model.cells.length - 1);
        if (endCell) {
            endCell.sharedModel.setSource(CELL_CONTENT.END_EXPERIMENT);
            console.log('[ReproLab] Added end_experiment cell');
        }
    }
    async executeExperiment() {
        console.log('[ReproLab] Running all cells...');
        await this.app.commands.execute('notebook:run-all-cells');
        await this.delay(2000);
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}


/***/ }),

/***/ "./lib/sections/zenodo.js":
/*!********************************!*\
  !*** ./lib/sections/zenodo.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ZenodoSection: () => (/* binding */ ZenodoSection)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./lib/utils.js");

class ZenodoSection {
    constructor(app, notebooks) {
        this.app = app;
        this.notebooks = notebooks;
    }
    render() {
        const zenodoContent = document.createElement('div');
        zenodoContent.innerHTML = '<p>You can in a few steps download the raw datasets and save the snapshots of software to the Zenodo for archiving</p>';
        zenodoContent.appendChild((0,_utils__WEBPACK_IMPORTED_MODULE_0__.createButton)('reprolab-zenodo-more', 'See more'));
        const section = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.createSection)('Publishing software and data to Zenodo', zenodoContent.innerHTML);
        return section.outerHTML;
    }
    handleZenodoButton(modal) {
        modal.style.display = 'flex';
    }
    async handleTestButton() {
        if (!this.validateNotebookContext()) {
            return;
        }
        try {
            await this.addReproducabilityCells();
            await this.executeFirstCell();
            console.log('[ReproLab] Reproducability package cells added successfully');
        }
        catch (error) {
            console.error('[ReproLab] Error adding reproducability cells:', error);
        }
    }
    validateNotebookContext() {
        var _a;
        if (!((_a = this.notebooks) === null || _a === void 0 ? void 0 : _a.currentWidget)) {
            console.error('[ReproLab] No active notebook found');
            return false;
        }
        if (!this.notebooks.currentWidget.content.model) {
            console.error('[ReproLab] No notebook model found');
            return false;
        }
        return true;
    }
    async addReproducabilityCells() {
        const notebook = this.notebooks.currentWidget.content;
        console.log('[ReproLab] Adding reproducability package cells...');
        // Add first cell at the bottom of the notebook
        const cellCount = notebook.model.cells.length;
        notebook.activeCellIndex = cellCount;
        this.app.commands.execute('notebook:insert-cell-below');
        await this.delay(100);
        const listTagsCell = notebook.model.cells.get(cellCount);
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
        const downloadCell = notebook.model.cells.get(cellCount + 1);
        if (downloadCell) {
            downloadCell.sharedModel.setSource(`from reprolab.experiment import download_reproducability_package
download_reproducability_package('<git_tag>')`);
            console.log('[ReproLab] Added download package cell');
        }
    }
    async executeFirstCell() {
        console.log('[ReproLab] Executing git tags listing cell...');
        const notebook = this.notebooks.currentWidget.content;
        const cellCount = notebook.model.cells.length;
        // Set the first new cell as active and execute it
        notebook.activeCellIndex = cellCount - 2; // First of the two new cells
        await this.app.commands.execute('notebook:run-cell');
        await this.delay(2000);
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}


/***/ }),

/***/ "./lib/utils.js":
/*!**********************!*\
  !*** ./lib/utils.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createButton: () => (/* binding */ createButton),
/* harmony export */   createInput: () => (/* binding */ createInput),
/* harmony export */   createSection: () => (/* binding */ createSection),
/* harmony export */   getXsrfToken: () => (/* binding */ getXsrfToken)
/* harmony export */ });
/**
 * Utility functions for the ReproLab extension
 */
/**
 * Creates a section element with a title and content
 */
function createSection(title, content) {
    const section = document.createElement('div');
    section.className = 'reprolab-section';
    section.innerHTML = `
    <h3>${title}</h3>
    ${content}
  `;
    return section;
}
/**
 * Creates a button element with the specified ID and text
 */
function createButton(id, text) {
    const button = document.createElement('button');
    button.id = id;
    button.className = 'reprolab-button';
    button.textContent = text;
    return button;
}
/**
 * Creates an input element with the specified ID, type, placeholder, default value, and placeholder text
 */
function createInput(id, type, placeholder, defaultValue = '', placeholderText = '') {
    const input = document.createElement('input');
    input.id = id;
    input.type = type;
    input.className = 'reprolab-input';
    input.placeholder = placeholderText || placeholder;
    input.value = defaultValue;
    return input;
}
/**
 * Gets the XSRF token from cookies
 */
function getXsrfToken() {
    const match = document.cookie.match('\\b_xsrf=([^;]*)\\b');
    return match ? decodeURIComponent(match[1]) : null;
}


/***/ })

}]);
//# sourceMappingURL=lib_index_js.b626633a6458028d2e0a.js.map