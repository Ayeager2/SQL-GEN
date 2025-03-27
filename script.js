/**
 * Database Schema Generator Module
 */
const SQLGenerator = (() => {
  // Constants
  const DATABASE_CONFIG = {
    existingTables: {
      users: ["user_id", "username"],
      orders: ["order_id", "user_id"]
    },
    fieldTypes: [
      "INT", "VARCHAR", "BIT", "DATE", "DECIMAL", 
      "TEXT", "FLOAT", "DATETIME", "GUID"
    ],
    defaultValues: {
      VARCHAR: 255,
      DECIMAL_PRECISION: 10,
      DECIMAL_SCALE: 2
    }
  };

  // DOM Elements
  const elements = {
    databaseForm: document.getElementById("databaseForm"),
    createDatabaseCheckbox: document.getElementById("createDatabaseCheckbox"),
    tableName: document.getElementById("tableName"),
    autoIncrementCheckbox: document.getElementById("autoIncrementCheckbox"),
    primaryKeyFields: document.getElementById("primaryKeyFields"),
    foreignKeyFields: document.getElementById("foreignKeyFields"),
    regularFields: document.getElementById("regularFields"),
    outputSchema: document.getElementById("outputSchema"),
    outputSQL: document.getElementById("outputSQL"),
    outputTestData: document.getElementById("outputTestData"),
    recordCount: document.getElementById("recordCount"),
    databaseName: document.getElementById("databaseName")
  };

  // Utility Functions
  const utils = {
    randomString: (length) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      return Array.from({length}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    },
    randomDate: () => {
      const start = new Date(2010, 0, 1);
      const end = new Date();
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
        .toISOString().split('T')[0];
    },
    randomDateTime: () => {
      const start = new Date(2010, 0, 1);
      const end = new Date();
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
        .toISOString().slice(0, 19).replace('T', ' ');
    },
    createElement: (tag, attributes = {}, children = []) => {
      const element = document.createElement(tag);
      Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
      if (Array.isArray(children)) {
        children.forEach(child => {
          if (child) element.appendChild(child instanceof Node ? child : document.createTextNode(child));
        });
      } else if (children) {
        element.appendChild(children instanceof Node ? children : document.createTextNode(children));
      }
      return element;
    }
  };

  // Form Field Management
  const fieldManager = {
    createFieldElement: (type) => {
      const isForeignKey = type === 'fk';
      const fieldClass = `${type}Field`;
      const typeClass = `${type}Type`;
      const paramClasses = [1, 2, 3].map(i => `${type}Param${i}`);

      const fieldInput = utils.createElement('input', {
        type: 'text',
        placeholder: 'Field Name',
        class: `form-control ${fieldClass}`
      });

      const typeSelect = utils.createElement('select', {
        class: `form-select ${typeClass}`
      }, DATABASE_CONFIG.fieldTypes.map(fieldType => 
        utils.createElement('option', { value: fieldType }, fieldType)
      ));

      const paramInputs = paramClasses.map((paramClass, i) => 
        utils.createElement('input', {
          type: 'number',
          placeholder: i === 0 ? 'Length' : i === 1 ? 'Precision' : 'Scale',
          class: `form-control ${paramClass}`,
          style: 'display: none;'
        })
      );

      const removeButton = utils.createElement('button', {
        type: 'button',
        class: 'btn btn-danger'
      }, '-');

      const fieldGroup = utils.createElement('div', {
        class: 'input-group mb-2'
      }, [fieldInput, typeSelect, ...paramInputs]);

      if (isForeignKey) {
        const tableSelect = utils.createElement('select', {
          class: 'form-select fkTable'
        }, [
          utils.createElement('option', { value: '' }, 'Select Table')
        ]);

        const fieldSelect = utils.createElement('select', {
          class: 'form-select fkReferencedField'
        }, [
          utils.createElement('option', { value: '' }, 'Select Field')
        ]);

        fieldGroup.appendChild(tableSelect);
        fieldGroup.appendChild(fieldSelect);
      }

      fieldGroup.appendChild(removeButton);
      return fieldGroup;
    },

    addField: (containerId, type) => {
      const container = document.getElementById(containerId);
      const newField = fieldManager.createFieldElement(type);
      container.appendChild(newField);
      
      if (type === 'fk') {
        populateTableDropdown();
      }
    },

    removeField: (button) => {
      button.parentElement.remove();
    }
  };

  // Main Functions
  const toggleDatabaseForm = () => {
    elements.databaseForm.style.display = 
      elements.createDatabaseCheckbox.checked ? "block" : "none";
  };

  const populateTableDropdown = () => {
    const dropdowns = document.querySelectorAll('.fkTable');
    dropdowns.forEach(dropdown => {
      dropdown.innerHTML = '<option value="">Select Table</option>';
      for (const tableName in DATABASE_CONFIG.existingTables) {
        const option = utils.createElement('option', { value: tableName }, tableName);
        dropdown.appendChild(option);
      }
    });
  };

  const populateReferencedFields = (tableDropdown) => {
    const referencedFieldDropdown = tableDropdown
      .closest('.input-group')
      .querySelector('.fkReferencedField');
    const selectedTable = tableDropdown.value;

    referencedFieldDropdown.innerHTML = '<option value="">Select Field</option>';

    if (selectedTable && DATABASE_CONFIG.existingTables[selectedTable]) {
      DATABASE_CONFIG.existingTables[selectedTable].forEach(field => {
        const option = utils.createElement('option', { value: field }, field);
        referencedFieldDropdown.appendChild(option);
      });
    }
  };

  const toggleFieldParams = (select) => {
    const parent = select.closest('.input-group');
    const params = [
      parent.querySelector('.pkParam1, .fkParam1, .regularParam1'),
      parent.querySelector('.pkParam2, .fkParam2, .regularParam2'),
      parent.querySelector('.pkParam3, .fkParam3, .regularParam3')
    ];

    params.forEach(param => param.style.display = 'none');

    switch (select.value) {
      case 'VARCHAR':
        params[0].placeholder = 'Length';
        params[0].style.display = 'inline-block';
        break;
      case 'DECIMAL':
        params[0].placeholder = 'Precision';
        params[1].placeholder = 'Scale';
        params[0].style.display = 'inline-block';
        params[1].style.display = 'inline-block';
        break;
    }
  };

  const collectFieldData = () => {
    const getFields = (selector, typePrefix) => 
      Array.from(document.querySelectorAll(`.${typePrefix}Field`))
        .map((input, i) => {
          if (!input.value || input.value.trim() === '') return null;
          
          return {
            fieldName: input.value.trim(),
            fieldType: document.querySelectorAll(`.${typePrefix}Type`)[i].value,
            param1: document.querySelectorAll(`.${typePrefix}Param1`)[i]?.value,
            param2: document.querySelectorAll(`.${typePrefix}Param2`)[i]?.value,
            param3: document.querySelectorAll(`.${typePrefix}Param3`)[i]?.value,
            isPrimaryKey: typePrefix === 'pk',
            ...(typePrefix === 'fk' && {
              referenceTable: document.querySelectorAll('.fkTable')[i]?.value,
              referenceField: document.querySelectorAll('.fkReferencedField')[i]?.value
            })
          };
        })
        .filter(field => field !== null);
  
    return {
      primaryKeys: getFields('.pkField', 'pk'),
      foreignKeys: getFields('.fkField', 'fk'),
      regularFields: getFields('.regularField', 'regular')
    };
  };

  const getFieldTypeWithParams = (field) => {
    switch (field.fieldType) {
      case 'VARCHAR':
        return `VARCHAR(${field.param1 || DATABASE_CONFIG.defaultValues.VARCHAR})`;
      case 'DECIMAL':
        return `DECIMAL(${field.param1 || DATABASE_CONFIG.defaultValues.DECIMAL_PRECISION}, ${
          field.param2 || DATABASE_CONFIG.defaultValues.DECIMAL_SCALE})`;
      case 'GUID':
        return 'UNIQUEIDENTIFIER';
      default:
        return field.fieldType;
    }
  };

  const generateSQL = (schema) => {
    let sql = '';
    const dbType = document.getElementById('databaseType').value;
    
    // Add drop statements if checkbox is checked
    const addDropLogic = document.getElementById('addDropLogicCheckbox').checked;
    console.log('Checkbox state:', document.getElementById('addDropLogicCheckbox').checked);
    if (addDropLogic) {
      sql = addDropStatements('', schema.tableName, schema.databaseName);
    }
  
    if (schema.databaseName) {
      sql += `CREATE DATABASE ${schema.databaseName};\n\n`;
      // sql += `USE ${schema.databaseName};\n\n`;
    }
  
    sql += "BEGIN TRANSACTION;\n\n";
    sql += `CREATE TABLE ${schema.tableName} (\n`;
  
    // Add auto-increment for SQL Server (IDENTITY)
    if (elements.autoIncrementCheckbox.checked && dbType === 'SQLServer') {
      sql += `  id INT IDENTITY(1,1) PRIMARY KEY,\n`;
    }
    // Add auto-increment for other databases
    else if (elements.autoIncrementCheckbox.checked) {
      sql += `  id INT PRIMARY KEY AUTO_INCREMENT,\n`;
    }
  
    // Function to add fields with proper syntax
    const addFields = fields => fields.forEach(field => {
      if (field.fieldName && field.fieldName.trim() !== '') {
        sql += `  ${field.fieldName} ${getFieldTypeWithParams(field)}`;
        
        // Add NOT NULL for primary keys
        if (field.isPrimaryKey) {
          sql += ' NOT NULL';
        }
        
        sql += ',\n';
      }
    });
  
    // Add primary key fields (not using auto-increment)
    if (!elements.autoIncrementCheckbox.checked) {
      addFields(schema.primaryKeys.map(pk => ({ ...pk, isPrimaryKey: true })));
    }
  
    // Add regular fields
    addFields(schema.regularFields);
  
    // Add foreign key fields
    addFields(schema.foreignKeys);
  
    // Add primary key constraint if not using auto-increment
    if (!elements.autoIncrementCheckbox.checked && schema.primaryKeys.length > 0) {
      const pkFields = schema.primaryKeys.map(pk => pk.fieldName).join(', ');
      sql += `  CONSTRAINT PK_${schema.tableName} PRIMARY KEY (${pkFields}),\n`;
    }
  
    // Add foreign key constraints
    schema.foreignKeys.forEach(fk => {
      if (fk.referenceTable && fk.referenceField) {
        sql += `  CONSTRAINT FK_${schema.tableName}_${fk.fieldName} `;
        sql += `FOREIGN KEY (${fk.fieldName}) `;
        sql += `REFERENCES ${fk.referenceTable}(${fk.referenceField}),\n`;
      }
    });
  
    // Remove trailing comma if exists
    if (sql.endsWith(',\n')) {
      sql = sql.slice(0, -2) + '\n';
    }
  
    sql += `);\n\n`;
    sql += "COMMIT;\n";
    sql += "\n-- If any error occurs, use: ROLLBACK;";
  
    return sql;
  };

  const generateTestValue = (field) => {
    switch (field.fieldType) {
      case 'INT': return Math.floor(Math.random() * 1000);
      case 'VARCHAR': return `'${utils.randomString(field.param1 || 50)}'`;
      case 'BIT': return Math.random() > 0.5 ? 1 : 0;
      case 'DATE': return `'${utils.randomDate()}'`;
      case 'DECIMAL': return (Math.random() * (field.param1 || 10)).toFixed(field.param2 || 2);
      case 'TEXT': return `'${utils.randomString(20)} ${utils.randomString(15)} ${utils.randomString(25)}'`;
      case 'FLOAT': return (Math.random() * 1000).toFixed(4);
      case 'DATETIME': return `'${utils.randomDateTime()}'`;
      case 'GUID': return 'NEWID()';
      default: return 'NULL';
    }
  };

  const generateTestData = () => {
    const recordCount = parseInt(elements.recordCount.value) || 10;
    const schema = JSON.parse(elements.outputSchema.textContent);
    
    let sql = `-- Test data for ${schema.tableName}\n`;
    sql += `-- ${recordCount} records\n\n`;
    
    for (let i = 0; i < recordCount; i++) {
      const columns = [];
      const values = [];
      
      // Combine all fields that have names (filter out empty/undefined fields)
      const allFields = [...schema.primaryKeys, ...schema.regularFields, ...schema.foreignKeys]
        .filter(field => field.fieldName && field.fieldName.trim() !== '');
      
      allFields.forEach(field => {
        columns.push(field.fieldName);
        values.push(generateTestValue(field));
      });
      
      // Only generate INSERT if we have columns
      if (columns.length > 0) {
        sql += `INSERT INTO ${schema.tableName} (${columns.join(', ')})\n`;
        sql += `VALUES (${values.join(', ')});\n\n`;
      }
    }
    
    elements.outputTestData.textContent = sql;
  };

  const generateSchemaAndSQL = () => {
    const createDatabase = elements.createDatabaseCheckbox.checked;
    const databaseName = createDatabase ? (elements.databaseName?.value || '') : null;
    const tableName = elements.tableName.value;
    
    if (!elements.tableName.value) {
      alert('Please enter a table name');
      return;
    }
    if (elements.createDatabaseCheckbox.checked && !elements.databaseName.value) {
      alert('Please enter a database name');
      return;
    }
    // Collect field data
    const fieldData = collectFieldData();
  
    // Generate Schema
    const schema = {
      databaseName: createDatabase ? databaseName : null,
      tableName,
      ...fieldData
    };
  
    // Display Schema
    elements.outputSchema.textContent = JSON.stringify(schema, null, 2);
  
    // Generate SQL
    elements.outputSQL.textContent = generateSQL(schema);
  
    // Show data generation section
    new bootstrap.Collapse(document.getElementById('collapseDataGen'), {
      toggle: false
    }).show();
  };

  const addDropStatements = (sql, tableName, databaseName) => {
    const dbType = document.getElementById('databaseType').value;
    let dropSQL = '';
    
    if (dbType === 'SQLServer') {
        if (databaseName) {
            dropSQL += `-- Drop database if exists (simple version)\n`;
            dropSQL += `IF EXISTS (SELECT name FROM sys.databases WHERE name = '${databaseName}')\n`;
            dropSQL += `  DROP DATABASE ${databaseName};\n\n`;
        }
        
        dropSQL += `-- Drop table if exists\n`;
        dropSQL += `IF OBJECT_ID('dbo.${tableName}', 'U') IS NOT NULL\n`;
        dropSQL += `  DROP TABLE dbo.${tableName};\n\n`;
    }
    // Add other database types here as needed
    
    return dropSQL + sql;
};

  const initCopyButtons = () => {
    // Add copy functionality
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const button = e.target.closest('.copy-btn'); // This handles event delegation
        if (!button) return;
        
        e.stopPropagation();
        const targetId = button.getAttribute('data-target');
        const contentElement = document.getElementById(targetId);
        
        if (!contentElement) return;
        
        const content = contentElement.textContent;
        
        navigator.clipboard.writeText(content).then(() => {
          // Show feedback
          const icon = button.querySelector('i');
          if (icon) {
            const originalIconClass = icon.className;
            icon.className = 'bi bi-check2';
            button.classList.replace('btn-outline-secondary', 'btn-success');
            
            setTimeout(() => {
              icon.className = originalIconClass;
              button.classList.replace('btn-success', 'btn-outline-secondary');
            }, 2000);
          }
        }).catch(err => {
          console.error('Failed to copy: ', err);
          const icon = button.querySelector('i');
          if (icon) {
            icon.className = 'bi bi-x';
            button.classList.replace('btn-outline-secondary', 'btn-danger');
            setTimeout(() => {
              icon.className = 'bi bi-clipboard';
              button.classList.replace('btn-danger', 'btn-outline-secondary');
            }, 2000);
          }
        });
      });
    });
  };

  // Initialize the application
  const init = () => {
    // Add initial fields
    // fieldManager.addField('primaryKeyFields', 'pk');
    // fieldManager.addField('foreignKeyFields', 'fk');
    // fieldManager.addField('regularFields', 'regular');

    // Set up event listeners
    elements.createDatabaseCheckbox.addEventListener('change', toggleDatabaseForm);
    document.getElementById('generateButton').addEventListener('click', generateSchemaAndSQL);
    document.getElementById('generateTestDataBtn').addEventListener('click', generateTestData);

    // Event delegation for dynamic elements
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-danger')) {
        fieldManager.removeField(e.target);
      }
      if (e.target.classList.contains('add-pk-btn')) {
        fieldManager.addField('primaryKeyFields', 'pk');
      }
      if (e.target.classList.contains('add-fk-btn')) {
        fieldManager.addField('foreignKeyFields', 'fk');
      }
      if (e.target.classList.contains('add-regular-btn')) {
        fieldManager.addField('regularFields', 'regular');
      }
    });

    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('pkType') || 
          e.target.classList.contains('fkType') || 
          e.target.classList.contains('regularType')) {
        toggleFieldParams(e.target);
      }
      if (e.target.classList.contains('fkTable')) {
        populateReferencedFields(e.target);
      }
    });
  };
  initCopyButtons();
  return {
    init
  };
})();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => SQLGenerator.init());