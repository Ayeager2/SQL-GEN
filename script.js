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
    default:
      return field.fieldType;
  }
}

// Initialize the form
function initializeForm() {
  populateTableDropdown();
  addPrimaryKeyField();
  addForeignKeyField();
  addRegularField();
}

// Call the initialize function when the page loads
window.onload = initializeForm;
