/**
 * Le Lab Robotique - Blocs OLED (SSD1306 I2C)
 *
 * Blocs Blockly pour contrôler un écran OLED 128x64 I2C (SSD1306)
 * via les librairies Adafruit_SSD1306 et Adafruit_GFX.
 */

function registerOledBlocks(Blockly, lang) {
  const t = (key) => lang[key] || key;

  // ─── Initialiser l'écran OLED ───
  Blockly.Blocks['oled_init'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(t('block_oled_init'));
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#607d8b');
      this.setTooltip(t('tooltip_oled_init'));
    }
  };

  // ─── Effacer l'écran ───
  Blockly.Blocks['oled_clear'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(t('block_oled_clear'));
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#607d8b');
      this.setTooltip(t('tooltip_oled_clear'));
    }
  };

  // ─── Afficher le buffer ───
  Blockly.Blocks['oled_display'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(t('block_oled_display'));
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#607d8b');
      this.setTooltip(t('tooltip_oled_display'));
    }
  };

  // ─── Positionner le curseur ───
  Blockly.Blocks['oled_set_cursor'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(t('block_oled_set_cursor'))
        .appendField('X:')
        .appendField(new Blockly.FieldNumber(0, 0, 127), 'X')
        .appendField('Y:')
        .appendField(new Blockly.FieldNumber(0, 0, 63), 'Y');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#607d8b');
      this.setTooltip(t('tooltip_oled_set_cursor'));
    }
  };

  // ─── Taille du texte ───
  Blockly.Blocks['oled_set_text_size'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(t('block_oled_text_size'))
        .appendField(new Blockly.FieldDropdown([
          ['Petit (1)', '1'],
          ['Moyen (2)', '2'],
          ['Grand (3)', '3'],
          ['Très grand (4)', '4'],
        ]), 'SIZE');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#607d8b');
      this.setTooltip(t('tooltip_oled_text_size'));
    }
  };

  // ─── Écrire du texte (print) ───
  Blockly.Blocks['oled_print'] = {
    init: function () {
      this.appendValueInput('TEXT')
        .appendField(t('block_oled_print'));
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#607d8b');
      this.setTooltip(t('tooltip_oled_print'));
    }
  };

  // ─── Écrire du texte avec retour à la ligne ───
  Blockly.Blocks['oled_println'] = {
    init: function () {
      this.appendValueInput('TEXT')
        .appendField(t('block_oled_println'));
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#607d8b');
      this.setTooltip(t('tooltip_oled_println'));
    }
  };

  // ─── Dessiner un rectangle ───
  Blockly.Blocks['oled_draw_rect'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(t('block_oled_rect'))
        .appendField('X:').appendField(new Blockly.FieldNumber(0, 0, 127), 'X')
        .appendField('Y:').appendField(new Blockly.FieldNumber(0, 0, 63), 'Y');
      this.appendDummyInput()
        .appendField('  Larg:').appendField(new Blockly.FieldNumber(20, 1, 128), 'W')
        .appendField('Haut:').appendField(new Blockly.FieldNumber(10, 1, 64), 'H')
        .appendField(new Blockly.FieldDropdown([['Contour', 'OUTLINE'], ['Rempli', 'FILLED']]), 'STYLE');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#607d8b');
      this.setTooltip(t('tooltip_oled_rect'));
    }
  };

  // ─── Dessiner un cercle ───
  Blockly.Blocks['oled_draw_circle'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(t('block_oled_circle'))
        .appendField('X:').appendField(new Blockly.FieldNumber(64, 0, 127), 'X')
        .appendField('Y:').appendField(new Blockly.FieldNumber(32, 0, 63), 'Y')
        .appendField('R:').appendField(new Blockly.FieldNumber(10, 1, 63), 'R')
        .appendField(new Blockly.FieldDropdown([['Contour', 'OUTLINE'], ['Rempli', 'FILLED']]), 'STYLE');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#607d8b');
      this.setTooltip(t('tooltip_oled_circle'));
    }
  };

  // ─── Dessiner une ligne ───
  Blockly.Blocks['oled_draw_line'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(t('block_oled_line'))
        .appendField('X1:').appendField(new Blockly.FieldNumber(0, 0, 127), 'X1')
        .appendField('Y1:').appendField(new Blockly.FieldNumber(0, 0, 63), 'Y1')
        .appendField('→ X2:').appendField(new Blockly.FieldNumber(127, 0, 127), 'X2')
        .appendField('Y2:').appendField(new Blockly.FieldNumber(63, 0, 63), 'Y2');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#607d8b');
      this.setTooltip(t('tooltip_oled_line'));
    }
  };

  // ─── Dessiner un pixel ───
  Blockly.Blocks['oled_draw_pixel'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(t('block_oled_pixel'))
        .appendField('X:').appendField(new Blockly.FieldNumber(0, 0, 127), 'X')
        .appendField('Y:').appendField(new Blockly.FieldNumber(0, 0, 63), 'Y');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#607d8b');
      this.setTooltip(t('tooltip_oled_pixel'));
    }
  };
}

/**
 * Register OLED code generators via the ArduinoGenerator plugin API.
 * Each generator function receives (block, ind, indentLevel) with `this` = generator.
 */
function registerOledGenerators(generator) {

  function ensureOledIncludes() {
    generator.addInclude('wire', '#include <Wire.h>');
    generator.addInclude('gfx', '#include <Adafruit_GFX.h>');
    generator.addInclude('ssd1306', '#include <Adafruit_SSD1306.h>');
    generator.addDeclaration('oled_obj',
      '#define SCREEN_WIDTH 128\n#define SCREEN_HEIGHT 64\nAdafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);');
  }

  generator.addBlockGenerator('oled_init', function (block, ind) {
    ensureOledIncludes();
    return `${ind}display.begin(SSD1306_SWITCHCAPVCC, 0x3C);\n`
         + `${ind}display.clearDisplay();\n`
         + `${ind}display.setTextSize(1);\n`
         + `${ind}display.setTextColor(SSD1306_WHITE);\n`
         + `${ind}display.display();\n`;
  });

  generator.addBlockGenerator('oled_clear', function (block, ind) {
    ensureOledIncludes();
    return `${ind}display.clearDisplay();\n`;
  });

  generator.addBlockGenerator('oled_display', function (block, ind) {
    ensureOledIncludes();
    return `${ind}display.display();\n`;
  });

  generator.addBlockGenerator('oled_set_cursor', function (block, ind) {
    ensureOledIncludes();
    return `${ind}display.setCursor(${block.getFieldValue('X')}, ${block.getFieldValue('Y')});\n`;
  });

  generator.addBlockGenerator('oled_set_text_size', function (block, ind) {
    ensureOledIncludes();
    return `${ind}display.setTextSize(${block.getFieldValue('SIZE')});\n`;
  });

  generator.addBlockGenerator('oled_print', function (block, ind) {
    ensureOledIncludes();
    const text = this.valueToCode(block, 'TEXT') || '""';
    return `${ind}display.print(${text});\n`;
  });

  generator.addBlockGenerator('oled_println', function (block, ind) {
    ensureOledIncludes();
    const text = this.valueToCode(block, 'TEXT') || '""';
    return `${ind}display.println(${text});\n`;
  });

  generator.addBlockGenerator('oled_draw_rect', function (block, ind) {
    ensureOledIncludes();
    const x = block.getFieldValue('X'), y = block.getFieldValue('Y');
    const w = block.getFieldValue('W'), h = block.getFieldValue('H');
    const fn = block.getFieldValue('STYLE') === 'FILLED' ? 'fillRect' : 'drawRect';
    return `${ind}display.${fn}(${x}, ${y}, ${w}, ${h}, SSD1306_WHITE);\n`;
  });

  generator.addBlockGenerator('oled_draw_circle', function (block, ind) {
    ensureOledIncludes();
    const x = block.getFieldValue('X'), y = block.getFieldValue('Y'), r = block.getFieldValue('R');
    const fn = block.getFieldValue('STYLE') === 'FILLED' ? 'fillCircle' : 'drawCircle';
    return `${ind}display.${fn}(${x}, ${y}, ${r}, SSD1306_WHITE);\n`;
  });

  generator.addBlockGenerator('oled_draw_line', function (block, ind) {
    ensureOledIncludes();
    return `${ind}display.drawLine(${block.getFieldValue('X1')}, ${block.getFieldValue('Y1')}, ${block.getFieldValue('X2')}, ${block.getFieldValue('Y2')}, SSD1306_WHITE);\n`;
  });

  generator.addBlockGenerator('oled_draw_pixel', function (block, ind) {
    ensureOledIncludes();
    return `${ind}display.drawPixel(${block.getFieldValue('X')}, ${block.getFieldValue('Y')}, SSD1306_WHITE);\n`;
  });
}

module.exports = { registerOledBlocks, registerOledGenerators };
