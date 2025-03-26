// script.js

// Example existing tables (you can modify this dynamically)
const existingTables = {
  users: ["user_id", "username"],
  orders: ["order_id", "user_id"],
};

// Toggle the database form based on the checkbox
function toggleDatabaseForm() {
  const databaseForm = document.getElementById("databaseForm");
  const createDatabaseCheckbox = document.getElementById(
    "createDatabaseCheckbox"
  );
  databaseForm.style.display = createDatabaseCheckbox.checked
    ? "block"
    : "none";
}

// Populate the foreign key table dropdown
function populateTableDropdown() {
  const dropdowns = document.querySelectorAll(".fkTable");
  dropdowns.forEach((dropdown) => {
    dropdown.innerHTML = '<option value="">Select Table</option>';
    for (const tableName in existingTables) {
      const option = document.createElement("option");
      option.value = tableName;
      option.textContent = tableName;
      dropdown.appendChild(option);
    }
  });
}

// Populate the referenced field dropdown based on the selected table
function populateReferencedFields(tableDropdown) {
  const referencedFieldDropdown = tableDropdown
    .closest(".input-group")
    .querySelector(".fkReferencedField");
  const selectedTable = tableDropdown.value;

  // Clear existing options
  referencedFieldDropdown.innerHTML = '<option value="">Select Field</option>';

  // Populate with fields from the selected table
  if (selectedTable && existingTables[selectedTable]) {
    existingTables[selectedTable].forEach((field) => {
      const option = document.createElement("option");
      option.value = field;
      option.textContent = field;
      referencedFieldDropdown.appendChild(option);
    });
  }
}

// Toggle parameter inputs based on the selected SQL type
function toggleFieldParams(select) {
  const parent = select.closest(".input-group");
  const param1 = parent.querySelector(".pkParam1, .fkParam1, .regularParam1");
  const param2 = parent.querySelector(".pkParam2, .fkParam2, .regularParam2");
  const param3 = parent.querySelector(".pkParam3, .fkParam3, .regularParam3");

  // Hide all parameter inputs initially
  param1.style.display = "none";
  param2.style.display = "none";
  param3.style.display = "none";

  // Show relevant parameter inputs based on the selected type
  switch (select.value) {
    case "VARCHAR":
      param1.placeholder = "Length";
      param1.style.display = "inline-block";
      break;
    case "DECIMAL":
      param1.placeholder = "Precision";
      param2.placeholder = "Scale";
      param1.style.display = "inline-block";
      param2.style.display = "inline-block";
      break;
    default:
      // No parameters needed for other types
      break;
  }
}

// Add a new primary key field
function addPrimaryKeyField() {
  const pkFields = document.getElementById("primaryKeyFields");
  const newField = document.createElement("div");
  newField.className = "input-group mb-2";
  newField.innerHTML = `
      <input type="text" placeholder="Field Name" class="form-control pkField">
      <select class="form-select pkType" onchange="toggleFieldParams(this)">
        <option value="INT">INT</option>
        <option value="VARCHAR">VARCHAR</option>
        <option value="BIT">BIT</option>
        <option value="DATE">DATE</option>
        <option value="DECIMAL">DECIMAL</option>
        <option value="TEXT">TEXT</option>
        <option value="FLOAT">FLOAT</option>
        <option value="DATETIME">DATETIME</option>
        <option value="BOOLEAN">BOOLEAN</option>
        <option value="GUID">GUID</option>
      </select>
      <input type="number" placeholder="Length" class="form-control pkParam1" style="display: none;">
      <input type="number" placeholder="Precision" class="form-control pkParam2" style="display: none;">
      <input type="number" placeholder="Scale" class="form-control pkParam3" style="display: none;">
      <button type="button" class="btn btn-danger" onclick="removeField(this)">-</button>
    `;
  pkFields.appendChild(newField);
}

// Add a new foreign key field
function addForeignKeyField() {
  const fkFields = document.getElementById("foreignKeyFields");
  const newField = document.createElement("div");
  newField.className = "input-group mb-2";
  newField.innerHTML = `
      <input type="text" placeholder="Field Name" class="form-control fkField">
      <select class="form-select fkType" onchange="toggleFieldParams(this)">
        <option value="INT">INT</option>
        <option value="VARCHAR">VARCHAR</option>
        <option value="BIT">BIT</option>
        <option value="DATE">DATE</option>
        <option value="DECIMAL">DECIMAL</option>
        <option value="TEXT">TEXT</option>
        <option value="FLOAT">FLOAT</option>
        <option value="DATETIME">DATETIME</option>
        <option value="BOOLEAN">BOOLEAN</option>
        <option value="GUID">GUID</option>
      </select>
      <input type="number" placeholder="Length" class="form-control fkParam1" style="display: none;">
      <input type="number" placeholder="Precision" class="form-control fkParam2" style="display: none;">
      <input type="number" placeholder="Scale" class="form-control fkParam3" style="display: none;">
      <select class="form-select fkTable" onchange="populateReferencedFields(this)">
        <option value="">Select Table</option>
      </select>
      <select class="form-select fkReferencedField">
        <option value="">Select Field</option>
      </select>
      <button type="button" class="btn btn-danger" onclick="removeField(this)">-</button>
    `;
  fkFields.appendChild(newField);
  populateTableDropdown();
}

// Add a new regular field
function addRegularField() {
  const regularFields = document.getElementById("regularFields");
  const newField = document.createElement("div");
  newField.className = "input-group mb-2";
  newField.innerHTML = `
      <input type="text" placeholder="Field Name" class="form-control regularField">
      <select class="form-select regularType" onchange="toggleFieldParams(this)">
        <option value="INT">INT</option>
        <option value="VARCHAR">VARCHAR</option>
        <option value="BIT">BIT</option>
        <option value="DATE">DATE</option>
        <option value="DECIMAL">DECIMAL</option>
        <option value="TEXT">TEXT</option>
        <option value="FLOAT">FLOAT</option>
        <option value="DATETIME">DATETIME</option>
        <option value="BOOLEAN">BOOLEAN</option>        
        <option value="GUID">GUID</option>
      </select>
      <input type="number" placeholder="Length" class="form-control regularParam1" style="display: none;">
      <input type="number" placeholder="Precision" class="form-control regularParam2" style="display: none;">
      <input type="number" placeholder="Scale" class="form-control regularParam3" style="display: none;">
      <button type="button" class="btn btn-danger" onclick="removeField(this)">-</button>
    `;
  regularFields.appendChild(newField);
}

// Remove a field (primary, foreign key, or regular)
function removeField(button) {
  button.parentElement.remove();
}

// Generate the schema and SQL
function generateSchemaAndSQL() {
  const createDatabase = document.getElementById(
    "createDatabaseCheckbox"
  ).checked;
  const databaseName = document.getElementById("databaseName").value;
  const tableName = document.getElementById("tableName").value;
  const pkFields = Array.from(document.querySelectorAll(".pkField")).map(
    (input, index) => ({
      fieldName: input.value,
      fieldType: document.querySelectorAll(".pkType")[index].value,
      param1: document.querySelectorAll(".pkParam1")[index].value,
      param2: document.querySelectorAll(".pkParam2")[index].value,
      param3: document.querySelectorAll(".pkParam3")[index].value,
    })
  );
  const fkFields = Array.from(document.querySelectorAll(".fkField")).map(
    (input, index) => ({
      fieldName: input.value,
      fieldType: document.querySelectorAll(".fkType")[index].value,
      param1: document.querySelectorAll(".fkParam1")[index].value,
      param2: document.querySelectorAll(".fkParam2")[index].value,
      param3: document.querySelectorAll(".fkParam3")[index].value,
      referenceTable: document.querySelectorAll(".fkTable")[index].value,
      referenceField:
        document.querySelectorAll(".fkReferencedField")[index].value,
    })
  );
  const regularFields = Array.from(
    document.querySelectorAll(".regularField")
  ).map((input, index) => ({
    fieldName: input.value,
    fieldType: document.querySelectorAll(".regularType")[index].value,
    param1: document.querySelectorAll(".regularParam1")[index].value,
    param2: document.querySelectorAll(".regularParam2")[index].value,
    param3: document.querySelectorAll(".regularParam3")[index].value,
  }));

  // Generate Schema
  const schema = {
    databaseName: createDatabase ? databaseName : null,
    tableName,
    primaryKeys: pkFields,
    foreignKeys: fkFields,
    regularFields: regularFields,
  };

  // Display Schema
  document.getElementById("outputSchema").textContent = JSON.stringify(
    schema,
    null,
    2
  );

  // Generate SQL
  const sql = generateSQL(schema);
  document.getElementById("outputSQL").textContent = sql;
  
 // Show the data generation section
 const dataGenCollapse = new bootstrap.Collapse(document.getElementById('collapseDataGen'), {
  toggle: false
});
dataGenCollapse.show();
}
// Generate SQL for creating the database and table
function generateSQL(schema) {
  let sql = "";

  // Create Database (if applicable)
  if (schema.databaseName) {
    sql += `CREATE DATABASE ${schema.databaseName};\n\n`;
    sql += `USE ${schema.databaseName};\n\n`;
  }

  // Start Transaction
  sql += "BEGIN TRANSACTION;\n\n";

  // Create Table
  sql += `CREATE TABLE ${schema.tableName} (\n`;

  // Add auto-incrementing ID field (if checkbox is checked)
  const autoIncrementCheckbox = document.getElementById(
    "autoIncrementCheckbox"
  );
  if (autoIncrementCheckbox.checked) {
    sql += `  id INT PRIMARY KEY AUTO_INCREMENT,\n`;
  }

  // Add primary keys
  schema.primaryKeys.forEach((field) => {
    sql += `  ${field.fieldName} ${getFieldTypeWithParams(field)},\n`;
  });

  // Add regular fields
  schema.regularFields.forEach((field) => {
    sql += `  ${field.fieldName} ${getFieldTypeWithParams(field)},\n`;
  });

  // Add foreign keys
  schema.foreignKeys.forEach((fk) => {
    if (fk.referenceTable && fk.referenceField) {
      sql += `  ${fk.fieldName} ${getFieldTypeWithParams(fk)},\n`;
      sql += `  FOREIGN KEY (${fk.fieldName}) REFERENCES ${fk.referenceTable}(${fk.referenceField}),\n`;
    }
  });

  // Remove the last comma and close the statement
  sql = sql.slice(0, -2) + "\n);\n\n";

  // Commit the transaction
  sql += "COMMIT;\n";

  // Rollback in case of error
  sql += "\n-- If any error occurs, use: ROLLBACK;";

  return sql;
}

// Helper function to get field type with parameters
function getFieldTypeWithParams(field) {
  switch (field.fieldType) {
    case "VARCHAR":
      return `${field.fieldType}(${field.param1 || 255})`;
    case "DECIMAL":
      return `${field.fieldType}(${field.param1 || 10}, ${field.param2 || 2})`;
    case "GUID":
      return `UNIQUEIDENTIFIER`
    default:
      return field.fieldType;
  }
}

// Add a new field based on the template
function addField(containerId, templateId) {
  const container = document.getElementById(containerId);
  const template = document.getElementById(templateId);
  
  // Clone the template content (first child)
  const newField = template.firstElementChild.cloneNode(true);
  
  // Clear any input values in the cloned field
  newField.querySelectorAll('input').forEach(input => {
    if (input.type !== 'button') {
      input.value = '';
    }
  });
  
  // Reset selects to their first option
  newField.querySelectorAll('select').forEach(select => {
    select.selectedIndex = 0;
    // If this is a type select, trigger params update
    if (select.classList.contains('pkType') || 
        select.classList.contains('fkType') || 
        select.classList.contains('regularType')) {
      toggleFieldParams(select);
    }
    // If this is a table select, repopulate referenced fields
    if (select.classList.contains('fkTable')) {
      populateReferencedFields(select);
    }
  });
  
  // Hide all parameter inputs initially
  newField.querySelectorAll('.pkParam1, .fkParam1, .regularParam1, .pkParam2, .fkParam2, .regularParam2, .pkParam3, .fkParam3, .regularParam3')
    .forEach(param => {
      param.style.display = 'none';
    });
  
  // Change the "+" button to a "-" button for removal
  const addButton = newField.querySelector('.btn-success');
  if (addButton) {
    addButton.className = 'btn btn-danger';
    addButton.textContent = '-';
    addButton.onclick = function() { removeField(this); };
  }
  
  // Add the new field to the container
  container.appendChild(newField);
  
  // If this is a foreign key field, populate the table dropdown
  if (containerId === 'foreignKeyFields') {
    populateTableDropdown();
  }
}

// Generate test data SQL
function generateTestData() {
  const recordCount = parseInt(document.getElementById('recordCount').value) || 10;
  const schema = JSON.parse(document.getElementById('outputSchema').textContent);
  
  let sql = `-- Test data for ${schema.tableName}\n`;
  sql += `-- ${recordCount} records\n\n`;
  
  // Generate INSERT statements
  for (let i = 0; i < recordCount; i++) {
    const columns = [];
    const values = [];
    
    // Handle all fields
    [...schema.primaryKeys, ...schema.regularFields, ...schema.foreignKeys].forEach(field => {
      columns.push(field.fieldName);
      values.push(generateTestValue(field));
    });
    
    sql += `INSERT INTO ${schema.tableName} (${columns.join(', ')})\n`;
    sql += `VALUES (${values.join(', ')});\n\n`;
  }
  
  document.getElementById('outputTestData').textContent = sql;
}

// Generate appropriate test value for a field
function generateTestValue(field) {
  switch (field.fieldType) {
    case 'INT':
      return Math.floor(Math.random() * 1000);
    case 'VARCHAR':
      const length = field.param1 || 50;
      return `'${randomString(length)}'`;
    case 'BIT':
      return Math.random() > 0.5 ? 1 : 0;
    case 'DATE':
      return `'${randomDate()}'`;
    case 'DECIMAL':
      const precision = field.param1 || 10;
      const scale = field.param2 || 2;
      return (Math.random() * precision).toFixed(scale);
    case 'TEXT':
      return `'${randomString(20)} ${randomString(15)} ${randomString(25)}'`;
    case 'FLOAT':
      return (Math.random() * 1000).toFixed(4);
    case 'DATETIME':
      return `'${randomDateTime()}'`;
    case 'BOOLEAN':
      return Math.random() > 0.5 ? 'TRUE' : 'FALSE';
    case 'GUID':
      return `NEWID()`; // For SQL Server
      // For MySQL: return `UUID()`;
      // For PostgreSQL: return `gen_random_uuid()`;
    default:
      return 'NULL';
  }
}

// Helper functions for generating random data
function randomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function randomDate() {
  const start = new Date(2010, 0, 1);
  const end = new Date();
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
    .toISOString().split('T')[0];
}

function randomDateTime() {
  const start = new Date(2010, 0, 1);
  const end = new Date();
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
    .toISOString().slice(0, 19).replace('T', ' ');
}

// Initialize the form
function initializeForm() {
  populateTableDropdown();
 
}

// Call the initialize function when the page loads
window.onload = initializeForm;
