const inquirer = require('inquirer');
const mysql = require("mysql2");
const util = require('util');

// Creates a connection to MySQL database
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123",
    database: "employees_db",
});

// Connects to the database
db.connect((err) => {
    if (err) throw err;
    console.log("Connected to the database.");
    startApp();
});

async function startApp() {
    while (true) {
    // Main menu
    const mainMenu = [
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                'View all departments',
                'View all roles',
                'View all employees',
                'Add a department',
                'Add a role',
                'Add an employee',
                'Update an employee role',
                'Exit',
            ],
        },
    ];

    // Get user choice from the main menu
    const { action } = await inquirer.prompt(mainMenu);

    // Perform actions based on user choice
    switch (action) {
        case 'View all departments':
            await viewAllDepartments();
            break;
        case 'View all roles':
            await viewAllRoles();
            break;
        case 'View all employees':
            await viewAllEmployees();
            break;
        case 'Add a department':
            await addDepartment();
            break;
        case 'Add a role':
            await addRole();
            break;
        case 'Add an employee':
            await addEmployee();
            break;
        case 'Update an employee role':
            await updateEmployeeRole();
            break;
        case 'Exit':
            console.log('Exiting application');
            process.exit();
            break;
    }
}

}


// Convert the query method to use promises
const query = util.promisify(db.query).bind(db);

async function viewAllDepartments() {
    try {
        const [rows] = await query('SELECT * FROM department');
        console.table(rows);
    } catch (error) {
        console.error('Error viewing departments:', error.message);
    }
}

async function viewAllRoles() {
    try {
        const [rows] = await query('SELECT * FROM role');
        console.table(rows);
    } catch (error) {
        console.error('Error viewing roles:', error.message);
    }
}

async function viewAllEmployees() {
    try {
        const [rows] = await query('SELECT * FROM employee');
        console.table(rows);
    } catch (error) {
        console.error('Error viewing employees:', error.message);
    }
}

async function addDepartment() {
    const departmentPrompt = [
        {
            type: 'input',
            name: 'departmentName',
            message: 'Enter the name of the new department:',
            validate: (input) => input.trim() !== '', // Ensure the input is not empty
        },
    ];

    try {
        const { departmentName } = await inquirer.prompt(departmentPrompt);

        // Execute SQL query to add the new department
        await query('INSERT INTO department (name) VALUES (?)', [departmentName]);

        console.log(`Department '${departmentName}' added successfully`);
    } catch (error) {
        console.error('Error adding department:', error.message);
    }
}

async function addRole() {
    const rolePrompt = [
        {
            type: 'input',
            name: 'roleTitle',
            message: 'Enter the title of the new role:',
            validate: (input) => input.trim() !== '', // Ensure the input is not empty
        },
        {
            type: 'input',
            name: 'roleSalary',
            message: 'Enter the salary for the new role:',
            validate: (input) => !isNaN(input) && parseFloat(input) >= 0, // Ensure it's a non-negative number
        },
        {
            type: 'input',
            name: 'roleDepartmentId',
            message: 'Enter the department ID for the new role:',
            validate: (input) => !isNaN(input) && parseInt(input) > 0, // Ensure it's a non-negative number
        },
    ];

    try {
        const { roleTitle, roleSalary, roleDepartmentId } = await inquirer.prompt(rolePrompt);

        // Execute SQL query to add the new role
        await query('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)', [roleTitle, roleSalary, roleDepartmentId]);

        console.log(`Role '${roleTitle}' added successfully`);
    } catch (error) {
        console.error('Error adding role:', error.message);
    }
}

async function addEmployee() {
    const employeePrompt = [
        {
            type: 'input',
            name: 'employeeFirstName',
            message: 'Enter the first name of the new employee:',
            validate: (input) => input.trim() !== '', // Ensure the input is not empty
        },
        {
            type: 'input',
            name: 'employeeLastName',
            message: 'Enter the last name of the new employee:',
            validate: (input) => input.trim() !== '', // Ensure the input is not empty
        },
        {
            type: 'input',
            name: 'employeeRoleId',
            message: 'Enter the role ID for the new employee:',
            validate: (input) => !isNaN(input) && parseInt(input) > 0, // Ensure it's a non-negative number
        },
        {
            type: 'input',
            name: 'employeeManagerId',
            message: 'Enter the manager ID for the new employee (if applicable):',
            validate: (input) => input === '' || (!isNaN(input) && parseInt(input) > 0), // Allow empty input or positive integer
        },
    ];

    try {
        const { employeeFirstName, employeeLastName, employeeRoleId, employeeManagerId } = await inquirer.prompt(employeePrompt);

        // Execute SQL query to add the new employee
        await query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', [employeeFirstName, employeeLastName, employeeRoleId, employeeManagerId || null]);

        console.log(`Employee '${employeeFirstName} ${employeeLastName}' added successfully`);
    } catch (error) {
        console.error('Error adding employee:', error.message);
    }
}

async function updateEmployeeRole() {
    try {
        // Get the list of employees for the user to choose from
        const employees = await query('SELECT id, first_name, last_name FROM employee');
        const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
            value: id,
            name: `${first_name} ${last_name}`,
        }));

        const employeePrompt = [
            {
                type: 'list',
                name: 'employeeId',
                message: 'Select the employee whose role you want to update:',
                choices: employeeChoices,
            },
        ];

        const { employeeId } = await inquirer.prompt(employeePrompt);

        // Get the list of roles for the user to choose from
        const roles = await query('SELECT id, title FROM role');
        const roleChoices = roles.map(({ id, title }) => ({
            value: id,
            name: title,
        }));

        const rolePrompt = [
            {
                type: 'list',
                name: 'newRoleId',
                message: 'Select the new role for the employee:',
                choices: roleChoices,
            },
        ];

        const { newRoleId } = await inquirer.prompt(rolePrompt);

        // Execute SQL query to update the employee's role
        await query('UPDATE employee SET role_id = ? WHERE id = ?', [newRoleId, employeeId]);

        console.log('Employee role updated successfully');
    } catch (error) {
        console.error('Error updating employee role:', error.message);
    }
}


