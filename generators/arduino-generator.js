/**
 * Arduino Code Generator for Le Lab Robotique
 * Traverses the Blockly workspace and produces valid Arduino .ino code.
 */

class ArduinoGenerator {
  constructor() {
    this.includes = new Set();
    this.globals = [];
    this.declarations = {};  // keyed declarations (deduplicated)
    this.setupCode = '';
    this.loopCode = '';
    this._usedUltrasonic = false;
    this._servoInstances = new Set();
    this._customGenerators = {};  // plugin block generators
  }

  // ═══════════════════════════════════════════
  // Plugin API — allows external block modules
  // to register their own code generators
  // ═══════════════════════════════════════════

  /** Add a #include line (deduplicated by key) */
  addInclude(key, code) {
    this.includes.add(code);
  }

  /** Add a global declaration (deduplicated by key) */
  addDeclaration(key, code) {
    this.declarations[key] = code;
  }

  /** Register a code generator for a custom block type */
  addBlockGenerator(blockType, fn) {
    this._customGenerators[blockType] = fn;
  }

  /** Public wrapper for _valueToCode (used by plugins) */
  valueToCode(block, inputName) {
    return this._valueToCode(block, inputName);
  }

  // ═══════════════════════════════════════════
  // Core generation
  // ═══════════════════════════════════════════

  generate(workspace) {
    this.includes = new Set();
    this.globals = [];
    this.declarations = {};
    this.setupCode = '';
    this.loopCode = '';
    this._usedUltrasonic = false;
    this._servoInstances = new Set();

    const topBlocks = workspace.getTopBlocks(true);

    for (const block of topBlocks) {
      if (block.type === 'arduino_setup_loop') {
        this.setupCode = this._statementsToCode(block, 'SETUP', 1);
        this.loopCode = this._statementsToCode(block, 'LOOP', 1);
      }
      if (block.type === 'procedures_defnoreturn' || block.type === 'procedures_defreturn') {
        this._blockToCode(block, 0);
      }
    }

    return this._assemble();
  }

  _assemble() {
    let code = '';

    // Includes
    if (this.includes.size > 0) {
      code += Array.from(this.includes).join('\n') + '\n\n';
    }

    // Keyed declarations (from plugins like OLED)
    const declValues = Object.values(this.declarations);
    if (declValues.length > 0) {
      code += declValues.join('\n') + '\n\n';
    }

    // Globals (servo instances, ultrasonic helper, etc.)
    if (this._usedUltrasonic) {
      this.globals.push(
        'long readUltrasonic(int trigPin, int echoPin) {',
        '  pinMode(trigPin, OUTPUT);',
        '  pinMode(echoPin, INPUT);',
        '  digitalWrite(trigPin, LOW);',
        '  delayMicroseconds(2);',
        '  digitalWrite(trigPin, HIGH);',
        '  delayMicroseconds(10);',
        '  digitalWrite(trigPin, LOW);',
        '  return pulseIn(echoPin, HIGH) / 58;',
        '}',
        ''
      );
    }

    if (this.globals.length > 0) {
      code += this.globals.join('\n') + '\n';
    }

    // Setup
    code += 'void setup() {\n';
    code += this.setupCode || '';
    // Add servo attach() calls (one per pin, always in setup)
    for (const pin of this._servoInstances) {
      code += `  servo_${pin}.attach(${pin});\n`;
    }
    code += '}\n\n';

    // Loop
    code += 'void loop() {\n';
    code += this.loopCode || '';
    code += '}\n';

    return code;
  }

  _statementsToCode(parentBlock, inputName, indentLevel) {
    let block = parentBlock.getInputTargetBlock(inputName);
    let code = '';
    while (block) {
      const line = this._blockToCode(block, indentLevel);
      if (line) code += line;
      block = block.getNextBlock();
    }
    return code;
  }

  _valueToCode(block, inputName) {
    const target = block.getInputTargetBlock(inputName);
    if (!target) return '0';
    const code = this._blockToCode(target, 0);
    return code ? code.replace(/;\s*\n?$/, '').trim() : '0';
  }

  _indent(level) {
    return '  '.repeat(level);
  }

  _blockToCode(block, indentLevel) {
    if (!block || block.disabled) return '';
    const ind = this._indent(indentLevel);
    const type = block.type;

    // Check custom/plugin generators first
    if (this._customGenerators[type]) {
      const gen = this._customGenerators[type];
      const result = gen.call(this, block, ind, indentLevel);
      return result || '';
    }

    switch (type) {
      // ─── Arduino Core ───
      case 'arduino_delay':
        return `${ind}delay(${this._valueToCode(block, 'TIME')});\n`;

      case 'arduino_delay_micro':
        return `${ind}delayMicroseconds(${this._valueToCode(block, 'TIME')});\n`;

      case 'arduino_millis':
        return 'millis()';

      case 'arduino_map':
        return `map(${this._valueToCode(block, 'VALUE')}, ${this._valueToCode(block, 'FROMLOW')}, ${this._valueToCode(block, 'FROMHIGH')}, ${this._valueToCode(block, 'TOLOW')}, ${this._valueToCode(block, 'TOHIGH')})`;

      // ─── Digital I/O ───
      case 'digital_write':
        return `${ind}digitalWrite(${block.getFieldValue('PIN')}, ${block.getFieldValue('STATE')});\n`;

      case 'digital_read':
        return `digitalRead(${block.getFieldValue('PIN')})`;

      case 'pin_mode':
        return `${ind}pinMode(${block.getFieldValue('PIN')}, ${block.getFieldValue('MODE')});\n`;

      // ─── Analog I/O ───
      case 'analog_write':
        return `${ind}analogWrite(${block.getFieldValue('PIN')}, ${this._valueToCode(block, 'VALUE')});\n`;

      case 'analog_read':
        return `analogRead(${block.getFieldValue('PIN')})`;

      // ─── Serial ───
      case 'serial_begin':
        return `${ind}Serial.begin(${this._valueToCode(block, 'BAUD')});\n`;

      case 'serial_print':
        return `${ind}Serial.print(${this._valueToCode(block, 'TEXT')});\n`;

      case 'serial_println':
        return `${ind}Serial.println(${this._valueToCode(block, 'TEXT')});\n`;

      case 'serial_available':
        return 'Serial.available()';

      case 'serial_read':
        return 'Serial.read()';

      // ─── Sensors ───
      case 'sensor_ultrasonic': {
        this._usedUltrasonic = true;
        return `readUltrasonic(${block.getFieldValue('TRIG')}, ${block.getFieldValue('ECHO')})`;
      }

      case 'sensor_temperature':
        return `(analogRead(${block.getFieldValue('PIN')}) * 5.0 / 1024.0 * 100.0)`;

      case 'sensor_button':
        return `(digitalRead(${block.getFieldValue('PIN')}) == LOW)`;

      case 'sensor_potentiometer':
        return `analogRead(${block.getFieldValue('PIN')})`;

      case 'sensor_light':
        return `analogRead(${block.getFieldValue('PIN')})`;

      // ─── Actuators ───
      case 'actuator_led':
        return `${ind}digitalWrite(${block.getFieldValue('PIN')}, ${block.getFieldValue('STATE')});\n`;

      case 'actuator_servo': {
        this.includes.add('#include <Servo.h>');
        const pin = block.getFieldValue('PIN');
        if (!this._servoInstances.has(pin)) {
          this._servoInstances.add(pin);
          this.globals.push(`Servo servo_${pin};`);
        }
        // attach() is added to setup automatically in _assemble()
        return `${ind}servo_${pin}.write(${this._valueToCode(block, 'ANGLE')});\n`;
      }

      case 'actuator_buzzer':
        return `${ind}tone(${block.getFieldValue('PIN')}, ${this._valueToCode(block, 'FREQ')}, ${this._valueToCode(block, 'DUR')});\n`;

      case 'actuator_motor':
        return `${ind}digitalWrite(${block.getFieldValue('PIN')}, ${block.getFieldValue('STATE')});\n`;

      case 'actuator_rgb_led':
        return `${ind}analogWrite(${block.getFieldValue('PINR')}, ${block.getFieldValue('R')});\n${ind}analogWrite(${block.getFieldValue('PING')}, ${block.getFieldValue('G')});\n${ind}analogWrite(${block.getFieldValue('PINB')}, ${block.getFieldValue('B')});\n`;

      // ─── Math ───
      case 'math_number':
        return String(block.getFieldValue('NUM'));

      case 'math_arithmetic': {
        const ops = { 'ADD': '+', 'MINUS': '-', 'MULTIPLY': '*', 'DIVIDE': '/', 'POWER': '**' };
        const op = ops[block.getFieldValue('OP')] || '+';
        const a = this._valueToCode(block, 'A');
        const b = this._valueToCode(block, 'B');
        if (op === '**') return `pow(${a}, ${b})`;
        return `(${a} ${op} ${b})`;
      }

      case 'math_random_int':
        return `random(${this._valueToCode(block, 'FROM')}, ${this._valueToCode(block, 'TO')} + 1)`;

      case 'math_constrain':
        return `constrain(${this._valueToCode(block, 'VALUE')}, ${this._valueToCode(block, 'LOW')}, ${this._valueToCode(block, 'HIGH')})`;

      case 'math_modulo':
        return `(${this._valueToCode(block, 'DIVIDEND')} % ${this._valueToCode(block, 'DIVISOR')})`;

      // ─── Logic ───
      case 'controls_if': {
        let code = '';
        let n = 0;
        while (block.getInput('IF' + n)) {
          const cond = this._valueToCode(block, 'IF' + n);
          const body = this._statementsToCode(block, 'DO' + n, indentLevel + 1);
          code += (n === 0 ? `${ind}if` : ` else if`) + ` (${cond}) {\n${body}${ind}}`;
          n++;
        }
        if (block.getInput('ELSE')) {
          const elseBody = this._statementsToCode(block, 'ELSE', indentLevel + 1);
          code += ` else {\n${elseBody}${ind}}`;
        }
        return code + '\n';
      }

      case 'logic_compare': {
        const ops = { 'EQ': '==', 'NEQ': '!=', 'LT': '<', 'LTE': '<=', 'GT': '>', 'GTE': '>=' };
        return `(${this._valueToCode(block, 'A')} ${ops[block.getFieldValue('OP')] || '=='} ${this._valueToCode(block, 'B')})`;
      }

      case 'logic_operation': {
        const op = block.getFieldValue('OP') === 'AND' ? '&&' : '||';
        return `(${this._valueToCode(block, 'A')} ${op} ${this._valueToCode(block, 'B')})`;
      }

      case 'logic_negate':
        return `!(${this._valueToCode(block, 'BOOL')})`;

      case 'logic_boolean':
        return block.getFieldValue('BOOL') === 'TRUE' ? 'true' : 'false';

      // ─── Loops ───
      case 'controls_repeat_ext': {
        const times = this._valueToCode(block, 'TIMES');
        const body = this._statementsToCode(block, 'DO', indentLevel + 1);
        return `${ind}for (int count = 0; count < ${times}; count++) {\n${body}${ind}}\n`;
      }

      case 'controls_whileUntil': {
        const mode = block.getFieldValue('MODE');
        const cond = this._valueToCode(block, 'BOOL');
        const body = this._statementsToCode(block, 'DO', indentLevel + 1);
        const condStr = mode === 'UNTIL' ? `!(${cond})` : cond;
        return `${ind}while (${condStr}) {\n${body}${ind}}\n`;
      }

      case 'controls_for': {
        const varName = block.getFieldValue('VAR');
        const from = this._valueToCode(block, 'FROM');
        const to = this._valueToCode(block, 'TO');
        const by = this._valueToCode(block, 'BY');
        const body = this._statementsToCode(block, 'DO', indentLevel + 1);
        return `${ind}for (int ${varName} = ${from}; ${varName} <= ${to}; ${varName} += ${by}) {\n${body}${ind}}\n`;
      }

      case 'controls_flow_statements':
        return block.getFieldValue('FLOW') === 'BREAK' ? `${ind}break;\n` : `${ind}continue;\n`;

      // ─── Variables ───
      case 'variables_get':
        return block.getFieldValue('VAR') || 'x';

      case 'variables_set':
        return `${ind}${block.getFieldValue('VAR') || 'x'} = ${this._valueToCode(block, 'VALUE')};\n`;

      // ─── Procedures ───
      case 'procedures_defnoreturn': {
        const name = block.getFieldValue('NAME') || 'maFonction';
        const body = this._statementsToCode(block, 'STACK', 1);
        this.globals.push(`void ${name}() {\n${body}}\n`);
        return '';
      }

      case 'procedures_defreturn': {
        const name = block.getFieldValue('NAME') || 'maFonction';
        const body = this._statementsToCode(block, 'STACK', 1);
        const retVal = this._valueToCode(block, 'RETURN');
        this.globals.push(`int ${name}() {\n${body}  return ${retVal};\n}\n`);
        return '';
      }

      case 'procedures_callnoreturn':
        return `${ind}${block.getFieldValue('NAME') || 'maFonction'}();\n`;

      case 'procedures_callreturn':
        return `${block.getFieldValue('NAME') || 'maFonction'}()`;

      // ─── Text ───
      case 'text':
        return `"${(block.getFieldValue('TEXT') || '').replace(/"/g, '\\"')}"`;

      default:
        return '';
    }
  }
}

module.exports = { ArduinoGenerator };
