import {SettingsData} from './settings';

const PLUGIN_DATA_KEY = 'hecvr/status';

const DEFAULT_COLOR: RGB = {r: 0, g: 0, b: 0};
const DEFAULT_FONT_NAME: FontName = {family: 'Roboto', style: 'Regular'};

interface ComponentData {
  version?: number;
  id?: string;
}

interface InstanceData {
  status?: string;
  id?: string;
}

const updateComponent = async (component: ComponentNode): Promise<void> => {
  // unlock component
  component.locked = false;

  // update component
  component.resize(375, 812);
  component.backgrounds = [];
  component.constraints = {horizontal: 'STRETCH', vertical: 'STRETCH'};
  // component.visible = false;

  // update badge
  const badge = component.findOne((node) => node.name === 'Status Badge') as GroupNode;
  badge.resize(160, 32);

  const badgeBackground = badge.findOne((node) => node.name === 'Status Badge Background') as RectangleNode;
  badgeBackground.resize(160, 32);
  badgeBackground.fills = [{type: 'SOLID', color: DEFAULT_COLOR}];
  badgeBackground.cornerRadius = 4.0;
  badgeBackground.bottomLeftRadius = 0;
  badgeBackground.bottomRightRadius = 0;
  badgeBackground.constraints = {horizontal: 'MIN', vertical: 'MIN'};

  const badgeText = badge.findOne((node) => node.name === 'Status Badge Text') as TextNode;
  badgeText.resize(160, 32);
  badgeText.textAlignHorizontal = 'CENTER';
  badgeText.textAlignVertical = 'CENTER';
  badgeText.textCase = 'UPPER';
  badgeText.fills = [{type: 'SOLID', color: {r: 1, g: 1, b: 1}}];
  badgeText.constraints = {horizontal: 'MIN', vertical: 'MIN'}

  // update borders
  const borders = component.findOne((node) => node.name === 'Status Borders') as RectangleNode;
  borders.resize(375, 780);
  borders.y = 32;
  borders.fills = [];
  borders.strokes = [{type: 'SOLID', color: {r: 1, g: 1, b: 1}}];
  borders.strokeAlign = 'INSIDE';
  borders.strokeWeight = 10;
  borders.cornerRadius = 4.0;
  borders.topLeftRadius = 0;
  borders.constraints = {horizontal: 'STRETCH', vertical: 'STRETCH'};

  // lock component
  component.locked = true;
};

const getComponent = async (): Promise<ComponentNode> => {
  let component = figma.getNodeById(figma.root.getPluginData(PLUGIN_DATA_KEY)) as ComponentNode;

  if (!component) {
    component = figma.createComponent();
    component.name = 'Status';

    // add badge
    const badgeBackground = figma.createRectangle();
    badgeBackground.name = 'Status Badge Background';

    const badgeText = figma.createText();
    badgeText.name = 'Status Badge Text';

    const badge = figma.group([badgeBackground, badgeText], component);
    badge.name = 'Status Badge';

    component.appendChild(badge);

    // add borders
    const borders = figma.createRectangle();
    borders.name = 'Status Borders';

    component.appendChild(borders);
  }

  // update component
  await updateComponent(component);

  // set plugin data for root
  figma.root.setPluginData(PLUGIN_DATA_KEY, component.id);

  return component;
};

const updateInstance = async (settings: SettingsData, status: string, instance: InstanceNode): Promise<void> => {
  const {name, color} = settings.statuses[status];

  // unlock instance
  instance.locked = false;

  // update badge
  const badge = instance.findOne((node) => node.name === 'Status Badge') as GroupNode;

  const badgeBackground = badge.findOne((node) => node.name === 'Status Badge Background') as RectangleNode;
  badgeBackground.fills = [{type: 'SOLID', color}];

  const badgeText = badge.findOne((node) => node.name === 'Status Badge Text') as TextNode;
  badgeText.characters = name;

  // update borders
  const borders = instance.findOne((node) => node.name === 'Status Borders') as RectangleNode;
  borders.strokes = [{type: 'SOLID', color}];

  // lock instance
  instance.locked = true;
};

const set = async (settings: SettingsData, status: string, frame: FrameNode): Promise<void> => {
  await figma.loadFontAsync(DEFAULT_FONT_NAME);

  // disable content clipping on frame
  frame.clipsContent = false;

  // create or update instance
  const data = JSON.parse(frame.getPluginData(PLUGIN_DATA_KEY) || '{}') as InstanceData;

  let instance = figma.getNodeById(data.id) as InstanceNode;
  if (!instance) {
    const component = await getComponent();

    // create instance
    instance = component.createInstance();
    instance.constraints = {horizontal: 'STRETCH', vertical: 'STRETCH'};

    // add component instance to frame
    frame.appendChild(instance);
  }

  // update component instance
  instance.resize(frame.width + 20, frame.height + 52);
  instance.x = -10;
  instance.y = -42;

  await updateInstance(settings, status, instance);

  // set plugin data for node
  frame.setPluginData(PLUGIN_DATA_KEY, JSON.stringify({status, id: instance.id}));
};

export default { set };
