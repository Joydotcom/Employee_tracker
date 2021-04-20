const mysql = require("mysql");
const inquirer = require("inquirer");
const util = require("util");
// create the connection information for the sql database
const connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "Sevette1",
  database: "employee_DB",
});

connection.promisifiedQuery = util.promisify(connection.query);

const employeeTrack = () => {
  inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View all Employees",
        "View all Employees by Manager",
        "Add Employee",
        "Remove Employee",
        "Update Manager",
        "View Roles",
        "Update Role",
        "Add Role",
        "Remove Role",
        "View Departments",
        "Add Departments",
        "Remove Departments",
      ],
    })
    .then((answer) => {
      console.log(answer.action);
      switch (answer.action) {
        case "View all Employees":
          viewEmployees();
          break;
        // case 'View all Employees by Manager':
        //     viewByManager();
        //     break;
        case "Add Employee":
          addEmployee();
          break;
        //     case 'Remove Employee':
        //         removeEmployee();
        //         break;
        case "Update Role":
          updateRole();
          break;
        //     case 'Update Manager':
        //         updateManager();
        //     case 'View Roles':
        //         viewRoles();
        //         break;
        //     case 'Add Role':
        //         addRole();
        //         break;
        case "Remove Role":
          removeRole();
          break;
        // case 'View Departments':
        //     viewDepartments();
        //     break;
        // case 'Add Departments':
        //     addDepartments();
        //     break;
        // case 'Remove Departments':
        //     removeDepartments();
        //     break;
        default:
          console.log(`Invalid action: ${answer.action}`);
          break;
      }
    });
};
const viewEmployees = () => {
  connection.query(
    "select a.id, a.first_name, a.last_name, title, department_id, salary, d.concatName from employee_db.employee a left join employee_db.role b on a.role_id=b.id left join employee_db.department c on b.department_id=c.id left join ( select a.first_name, a.last_name, concat(b.first_name,b.last_name) as concatName, a.manager_id,a.id from employee_db.employee a inner join employee_db.employee b on a.manager_id=b.id) d on a.id =d.id",
    (err, res) => {
      if (err) throw err;
      console.table(res);
      employeeTrack();
    }
  );
};

const addEmployee = () => {
    connection.query("SELECT id, title FROM role", (err, res) => {
      if (err) throw err;
      const role = res.map((role) => {
        return {
          name: role.title,
          value: role.id,
        };
      });
      inquirer
        .prompt([
          {
            name: "first_name",
            type: "input",
            message: "What is their first name:",
          },
          {
            name: "last",
            type: "last",
            message: "What is their last name:",
          },
          {
            name: "role",
            type: "list",
            message: "What is their role:",
            choices: role,
          },
          {
            name: "manager",
            type: "input",
            message: "Who is their manager:",
          },
        ])
        .then((answers) => {
          connection.query(
            `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("${answers.first}", "${answers.last}", ${answers.role}, ${answers.manager})`,
            (err, data) => {
              if (err) throw err;
              console.log("New employee added!");
              employeeTrack();
            }
          );
        });
    });
  };

const updateRole = async () => {
  const roleArray = await getRoleArray();
  const departmentArray = await getDepartmentArray();
  inquirer
    .prompt([
      {
        name: "role_id",
        type: "list",
        message: "What role would you like to update?",
        choices: roleArray,
      },
    ])
    .then(({ answer }) => {
      inquirer
        .prompt([
          {
            name: "name",
            type: "input",
            message: "What is the name of the role?",
          },
          {
            name: "salary",
            type: "input",
            message: "What is the salary for the role?",
          },
          {
            name: "department_id",
            type: "list",
            message: "What department is this role for?",
            choices: departmentArray,
          },
        ])
        .then(({ answer2}) => {
            connection.query(
                "UPDATE role SET ? WHERE ?",
                [
                  {
                    title: answer2.name,
                    salary: answer2.salary,
                    department_id: answer2.department_id,
                  },
                  {
                    id: answer.role_id,
                  },
                ],
                (err) => {
                  if (err) throw err;
                }
              );

        });
    });
  // get all roles from the db (select * from role)
  // ask user which role they want to update (selectedRoleId)
  // ask user for updated info
  // update the appropriate role (update role set {...) where id  = answer.role_id
};
// const viewByManager = () => {
//     connection.query(
//         'select a.id, a.first_name, a.last_name, title, department_id, salary, d.concatName from employee_db.employee a left join employee_db.role b on a.role_id=b.id left join employee_db.department c on b.department_id=c.id left join ( select a.first_name, a.last_name, concat(b.first_name,b.last_name) as concatName, a.manager_id,a.id from employee_db.employee a inner join employee_db.employee b on a.manager_id=b.id) d on a.id =d.id',
//         (err, res) => {
//             if (err) throw err;
//             console.table(res);
//             employeeTrack();
//         })
// }
const getDepartmentArray = async () => {
  const departmentArray = await connection.promisifiedQuery(
    "SELECT * FROM department"
  );

  return departmentArray.map((department) => {
    return {
      name: department.name,
      value: department.id,
    };
  });
};

const getRoleArray = async () => {
  const roleArray = await connection.promisifiedQuery("SELECT * FROM role");

  return roleArray.map((role) => {
    return {
      name: role.title,
      value: role.id,
    };
  });
};

const getManagerArray = async () => {
  const managerArray = await connection.promisifiedQuery(
    "select id, concat(first_name, \" \",last_name) as employees from employee"
  );

  return managerArray.map((manager) => {
    return {
      name: manager.employees,
      value: manager.manager_id,
    };
  });
};

const removeRole = async () => {
  const roleArray = await getRoleArray();
  inquirer
    .prompt([
      {
        type: "list",
        name: "removeRole",
        choices: roleArray,
        message: "Which role would you like to remove?",
      },
    ])
    .then(({ removeRole }) => {
      connection.query(
        "DELETE FROM role WHERE ?",
        {
          id: removeRole,
        },
        (err, data) => {
          if (err) throw err;
        }
      );
    });
};

connection.connect((err) => {
  if (err) throw err;
  employeeTrack();
});
