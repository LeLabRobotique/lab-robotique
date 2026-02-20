/**
 * Custom Arduino Blocks for Le Lab Robotique
 * All block definitions in one module.
 */

function pinOptions() {
  const pins = [];
  for (let i = 0; i <= 13; i++) pins.push([String(i), String(i)]);
  return pins;
}

function pwmPinOptions() {
  return [['3','3'],['5','5'],['6','6'],['9','9'],['10','10'],['11','11']];
}

function analogPinOptions() {
  return [['A0','A0'],['A1','A1'],['A2','A2'],['A3','A3'],['A4','A4'],['A5','A5']];
}

function registerBlocks(Blockly, lang) {
  const t = (key) => lang[key] || key;

  // ═══════════════════════════════════════════
  // ARDUINO CORE
  // ═══════════════════════════════════════════
  Blockly.Blocks['arduino_setup_loop'] = {
    init: function() {
      this.appendDummyInput().appendField(t('block_setup'));
      this.appendStatementInput('SETUP');
      this.appendDummyInput().appendField(t('block_loop'));
      this.appendStatementInput('LOOP');
      this.setColour('#4caf50');
      this.setDeletable(false);
      this.setTooltip('Configuration (exécuté une fois) + Boucle (répété indéfiniment)');
    }
  };

  Blockly.Blocks['arduino_delay'] = {
    init: function() {
      this.appendValueInput('TIME').setCheck('Number').appendField(t('block_delay_ms'));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour('#e8942e');
      this.setTooltip('Pause en millisecondes');
    }
  };

  Blockly.Blocks['arduino_delay_micro'] = {
    init: function() {
      this.appendValueInput('TIME').setCheck('Number').appendField(t('block_delay_us'));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour('#e8942e');
    }
  };

  Blockly.Blocks['arduino_millis'] = {
    init: function() {
      this.appendDummyInput().appendField('millis()');
      this.setOutput(true, 'Number');
      this.setColour('#e8942e');
      this.setTooltip('Temps écoulé depuis le démarrage (ms)');
    }
  };

  Blockly.Blocks['arduino_map'] = {
    init: function() {
      this.appendValueInput('VALUE').setCheck('Number').appendField(t('block_map'));
      this.appendValueInput('FROMLOW').setCheck('Number').appendField(t('block_map_from_min'));
      this.appendValueInput('FROMHIGH').setCheck('Number').appendField(t('block_map_from_max'));
      this.appendValueInput('TOLOW').setCheck('Number').appendField(t('block_map_to_min'));
      this.appendValueInput('TOHIGH').setCheck('Number').appendField(t('block_map_to_max'));
      this.setOutput(true, 'Number');
      this.setColour('#e8942e');
      this.setInputsInline(false);
    }
  };

  // ═══════════════════════════════════════════
  // DIGITAL I/O
  // ═══════════════════════════════════════════
  Blockly.Blocks['digital_write'] = {
    init: function() {
      this.appendDummyInput()
        .appendField(t('block_digital_write'))
        .appendField(new Blockly.FieldDropdown(pinOptions()), 'PIN')
        .appendField(new Blockly.FieldDropdown([['HIGH','HIGH'],['LOW','LOW']]), 'STATE');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour('#4caf50');
    }
  };

  Blockly.Blocks['digital_read'] = {
    init: function() {
      this.appendDummyInput()
        .appendField(t('block_digital_read'))
        .appendField(new Blockly.FieldDropdown(pinOptions()), 'PIN');
      this.setOutput(true, 'Number');
      this.setColour('#4caf50');
    }
  };

  Blockly.Blocks['pin_mode'] = {
    init: function() {
      this.appendDummyInput()
        .appendField(t('block_pin_mode'))
        .appendField(new Blockly.FieldDropdown(pinOptions()), 'PIN')
        .appendField(t('block_pin_as'))
        .appendField(new Blockly.FieldDropdown([
          [t('block_output'), 'OUTPUT'],
          [t('block_input'), 'INPUT'],
          [t('block_input_pullup'), 'INPUT_PULLUP']
        ]), 'MODE');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour('#4caf50');
    }
  };

  // ═══════════════════════════════════════════
  // ANALOG I/O
  // ═══════════════════════════════════════════
  Blockly.Blocks['analog_write'] = {
    init: function() {
      this.appendValueInput('VALUE').setCheck('Number')
        .appendField(t('block_analog_write'))
        .appendField(new Blockly.FieldDropdown(pwmPinOptions()), 'PIN');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour('#2196f3');
    }
  };

  Blockly.Blocks['analog_read'] = {
    init: function() {
      this.appendDummyInput()
        .appendField(t('block_analog_read'))
        .appendField(new Blockly.FieldDropdown(analogPinOptions()), 'PIN');
      this.setOutput(true, 'Number');
      this.setColour('#2196f3');
    }
  };

  // ═══════════════════════════════════════════
  // SERIAL
  // ═══════════════════════════════════════════
  Blockly.Blocks['serial_begin'] = {
    init: function() {
      this.appendValueInput('BAUD').setCheck('Number').appendField(t('block_serial_begin'));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour('#e74c3c');
    }
  };

  Blockly.Blocks['serial_print'] = {
    init: function() {
      this.appendValueInput('TEXT').appendField(t('block_serial_print'));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour('#e74c3c');
    }
  };

  Blockly.Blocks['serial_println'] = {
    init: function() {
      this.appendValueInput('TEXT').appendField(t('block_serial_println'));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour('#e74c3c');
    }
  };

  Blockly.Blocks['serial_available'] = {
    init: function() {
      this.appendDummyInput().appendField(t('block_serial_available'));
      this.setOutput(true, 'Boolean');
      this.setColour('#e74c3c');
    }
  };

  Blockly.Blocks['serial_read'] = {
    init: function() {
      this.appendDummyInput().appendField(t('block_serial_read'));
      this.setOutput(true, 'Number');
      this.setColour('#e74c3c');
    }
  };

  // ═══════════════════════════════════════════
  // SENSORS
  // ═══════════════════════════════════════════
  Blockly.Blocks['sensor_ultrasonic'] = {
    init: function() {
      this.appendDummyInput()
        .appendField(t('block_ultrasonic'))
        .appendField(new Blockly.FieldDropdown(pinOptions()), 'TRIG')
        .appendField(t('block_echo'))
        .appendField(new Blockly.FieldDropdown(pinOptions()), 'ECHO');
      this.setOutput(true, 'Number');
      this.setColour('#00bcd4');
      this.setTooltip('Retourne la distance en cm');
    }
  };

  Blockly.Blocks['sensor_temperature'] = {
    init: function() {
      this.appendDummyInput()
        .appendField(t('block_temperature'))
        .appendField(new Blockly.FieldDropdown(analogPinOptions()), 'PIN');
      this.setOutput(true, 'Number');
      this.setColour('#00bcd4');
    }
  };

  Blockly.Blocks['sensor_button'] = {
    init: function() {
      this.appendDummyInput()
        .appendField(t('block_button'))
        .appendField(new Blockly.FieldDropdown(pinOptions()), 'PIN');
      this.setOutput(true, 'Boolean');
      this.setColour('#00bcd4');
    }
  };

  Blockly.Blocks['sensor_potentiometer'] = {
    init: function() {
      this.appendDummyInput()
        .appendField(t('block_potentiometer'))
        .appendField(new Blockly.FieldDropdown(analogPinOptions()), 'PIN');
      this.setOutput(true, 'Number');
      this.setColour('#00bcd4');
    }
  };

  Blockly.Blocks['sensor_light'] = {
    init: function() {
      this.appendDummyInput()
        .appendField(t('block_light_sensor'))
        .appendField(new Blockly.FieldDropdown(analogPinOptions()), 'PIN');
      this.setOutput(true, 'Number');
      this.setColour('#00bcd4');
    }
  };

  // ═══════════════════════════════════════════
  // ACTUATORS
  // ═══════════════════════════════════════════
  Blockly.Blocks['actuator_led'] = {
    init: function() {
      this.appendDummyInput()
        .appendField(t('block_led'))
        .appendField(new Blockly.FieldDropdown(pinOptions()), 'PIN')
        .appendField(new Blockly.FieldDropdown([
          [t('block_led_on'), 'HIGH'],
          [t('block_led_off'), 'LOW']
        ]), 'STATE');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour('#ff5722');
    }
  };

  Blockly.Blocks['actuator_servo'] = {
    init: function() {
      this.appendValueInput('ANGLE').setCheck('Number')
        .appendField(t('block_servo'))
        .appendField(new Blockly.FieldDropdown(pinOptions()), 'PIN')
        .appendField(t('block_servo_angle'));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour('#ff5722');
    }
  };

  Blockly.Blocks['actuator_buzzer'] = {
    init: function() {
      this.appendValueInput('FREQ').setCheck('Number')
        .appendField(t('block_buzzer'))
        .appendField(new Blockly.FieldDropdown(pinOptions()), 'PIN')
        .appendField(t('block_buzzer_freq'));
      this.appendValueInput('DUR').setCheck('Number').appendField(t('block_buzzer_dur'));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour('#ff5722');
      this.setInputsInline(false);
    }
  };

  Blockly.Blocks['actuator_motor'] = {
    init: function() {
      this.appendDummyInput()
        .appendField(t('block_motor'))
        .appendField(new Blockly.FieldDropdown(pinOptions()), 'PIN')
        .appendField(new Blockly.FieldDropdown([
          [t('block_motor_fwd'), 'HIGH'],
          [t('block_motor_stop'), 'LOW']
        ]), 'STATE');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour('#ff5722');
    }
  };

  Blockly.Blocks['actuator_rgb_led'] = {
    init: function() {
      this.appendDummyInput().appendField(t('block_rgb'));
      this.appendDummyInput()
        .appendField(t('block_rgb_r')).appendField(new Blockly.FieldDropdown(pwmPinOptions()), 'PINR')
        .appendField(t('block_value')).appendField(new Blockly.FieldNumber(0, 0, 255), 'R');
      this.appendDummyInput()
        .appendField(t('block_rgb_g')).appendField(new Blockly.FieldDropdown(pwmPinOptions()), 'PING')
        .appendField(t('block_value')).appendField(new Blockly.FieldNumber(0, 0, 255), 'G');
      this.appendDummyInput()
        .appendField(t('block_rgb_b')).appendField(new Blockly.FieldDropdown(pwmPinOptions()), 'PINB')
        .appendField(t('block_value')).appendField(new Blockly.FieldNumber(0, 0, 255), 'B');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour('#ff5722');
    }
  };
}

module.exports = { registerBlocks };
