import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  ICommandPalette,
  MainAreaWidget,
  WidgetTracker
} from '@jupyterlab/apputils';

import {
  LabIcon
} from '@jupyterlab/ui-components';

import {
  Widget
} from '@lumino/widgets';

// Create a custom icon
const icon = new LabIcon({
  name: 'reprolab:icon',
  svgstr: '<svg xmlns="http://www.w3.org/2000/svg" width="16" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="currentColor"/></svg>'
});

// Create a widget for the panel
class ReprolabWidget extends Widget {
  constructor() {
    super();
    this.addClass('reprolab-widget');
    this.title.label = 'ReproLab';
    this.title.icon = icon;
    this.title.closable = true;
    
    // Add content to the widget
    const content = document.createElement('div');
    content.innerHTML = '<h2>ReproLab Panel</h2><p>Welcome to ReproLab!</p>';
    this.node.appendChild(content);
  }
}

/**
 * Initialization data for the reprolab extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'reprolab:plugin',
  description: 'One step closer reproducible research',
  autoStart: true,
  requires: [ICommandPalette],
  activate: (app: JupyterFrontEnd, palette: ICommandPalette) => {
    console.log('JupyterLab extension reprolab is activated!');

    // Create a widget tracker
    const tracker = new WidgetTracker<MainAreaWidget>({
      namespace: 'reprolab'
    });

    // Add command to open the panel
    app.commands.addCommand('reprolab:open', {
      label: 'Open ReproLab Panel',
      icon: icon,
      execute: () => {
        // Create the widget
        const widget = new ReprolabWidget();
        const main = new MainAreaWidget({ content: widget });
        
        // Add to the main area
        app.shell.add(main, 'left', { rank: 100 });
        
        // Track the widget
        tracker.add(main);
        
        // Activate the widget
        app.shell.activateById(main.id);
      }
    });

    // Add the command to the command palette
    palette.addItem({ command: 'reprolab:open', category: 'ReproLab' });

    // Create a sidebar widget
    const sidebarWidget = new Widget();
    sidebarWidget.id = 'reprolab-sidebar';
    sidebarWidget.addClass('jp-SideBar');
    sidebarWidget.addClass('reprolab-sidebar');
    sidebarWidget.title.icon = icon;
    sidebarWidget.title.label = 'ReproLab';
    sidebarWidget.title.caption = 'ReproLab Panel';
    
    // Add click handler
    sidebarWidget.node.onclick = () => {
      app.commands.execute('reprolab:open');
    };

    // Add the widget to the sidebar
    app.shell.add(sidebarWidget, 'left', { rank: 100 });
  }
};

export default plugin;
