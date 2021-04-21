const mysql = require("mysql");
const inquirer = require("inquirer");
const util = require("util");
const { listenerCount } = require("events");

const connection = mysql.createConnection({
  host: "localhost",

  port: 3306,

  user: "root",

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
        "View Departments",
        "View Roles",
        "Add Employee",
        "Add Role",
        "Add Departments",
        "Update Manager",
        "Update Role",
        "Remove Employee",
        "Remove Role",
        "Remove Departments",
      ],
    })
    .then((answer) => {
      console.log(answer.action);
      switch (answer.action) {
        case "View all Employees":
          viewEmployees();
          break;
        case "View Roles":
          viewRoles();
          break;
        case "View Departments":
          viewDepartments();
          break;
        case "Add Employee":
          addEmployee();
          break;
        case "Add Role":
          addRole();
          break;
        case 'Add Departments':
            addDepartments();
            break;
        //     case 'Update Manager':
        //         updateManager();
        case "Update Role":
          updateRole();
          break;
        case "Remove Employee":
          removeEmployee();
          break;
        case "Remove Role":
          removeRole();
          break;

        case "Remove Departments":
          removeDepartments();
          break;
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

const viewDepartments = () => {
  connection.query("SELECT id, name FROM department", (err, res) => {
    if (err) throw err;
    console.table(res);
    employeeTrack();
  });
};

const viewRoles = () => {
  connection.query("Select * from role", (err, res) => {
    if (err) throw err;
    console.table(res);
    employeeTrack();
  });
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
          name: "first",
          type: "input",
          message: "What is the employees first name?",
        },
        {
          name: "last",
          type: "input",
          message: "What is the employees last name?",
        },
        {
          name: "role",
          type: "list",
          message: "What is the role of the employee?",
          choices: role,
        },
        {
          name: "manager",
          type: "input",
          message: "Who is the employees manager (Id number)?",
        },
      ])
      .then((answers) => {
        connection.query(
          `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("${answers.first}", "${answers.last}", ${answers.role}, ${answers.manager})`,
          (err, data) => {
            if (err) throw err;
            console.log("You've successfully added a new employee!");
            employeeTrack();
          }
        );
      });
  });
};

const addRole = () => {
    connection.query("SELECT id, name FROM department", (err, res) => {
      if (err) throw err;
      const dept = res.map((department) => {
        return {
          name: department.name,
          value: department.id,
        };
      });
      inquirer
        .prompt([
          {
            name: "title",
            type: "input",
            message: "Which role would you like to add?",
          },
          {
            name: "salary",
            type: "input",
            message: "What is the salary for this role?",
          },
          {
            name: "department",
            type: "list",
            message: "Which department does this role fall under?",
            choices: dept,
          },
        ])
        .then((answers) => {
          connection.query(
            `INSERT INTO role (title, salary, department_id) VALUES ("${answers.title}", ${answers.salary}, ${answers.department})`,
            (err, data) => {
              if (err) throw err;
              console.log("New role added!");
              employeeTrack();
            }
          );
        });
    });
  };

  const addDepartment = () => {
    inquirer
        .prompt([{
            name: "title",
            type: "input",
            message: "What is the title of the new department?",
        }, ])
        .then((answers) => {
            connection.query(
                `INSERT INTO department (name) VALUES ("${answers.title}")`,
                (err, data) => {
                    if (err) throw err;
                    console.log("Successfully added new department!");
                    employeeTrack();
                }
            );
        });
};


const updateRole = () => {
  // Query to get department names
  connection.query(
    'select*,a.id as empID, concat(first_name, " ", last_name) as concatName from employee a left join role b on a.role_id = b.id',
    (err, res) => {
      if (err) throw err;
      const employeeUpdate = res.map((employeeUpdate) => {
        return {
          name: employeeUpdate.concatName,
          value: employeeUpdate.empID,
        };
      });
      const roleUpdate = res.map((roleUpdate) => {
        return {
          name: roleUpdate.title,
          value: roleUpdate.id,
        };
      });
      inquirer
        .prompt([
          {
            name: "employee",
            type: "list",
            message: "Which employee would you like to update?",
            choices: employeeUpdate,
          },
          {
            name: "newRole",
            type: "list",
            message: "Choose a role for the new employee?",
            choices: roleUpdate,
          },
        ])
        .then((answers) => {
          connection.query(
            `UPDATE employee SET role_id = ${answers.newRole} where employee.id = ${answers.employee}`,
            (err, data) => {
              if (err) throw err;
              console.log("Role updated!");
              employeeTrack();
            }
          );
        });
    }
  );
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
// const getDepartmentArray = async () => {
//   const departmentArray = await connection.promisifiedQuery(
//     "SELECT * FROM department"
//   );

//   return departmentArray.map((department) => {
//     return {
//       name: department.name,
//       value: department.id,
//     };
//   });
// };

// const getEmployeeArray = async () => {
//     const emplpoyeeArray = await connection.promisifiedQuery("SELECT * FROM employee");

//     return employeeArray.map((employee) => {
//       return {
//         name: role.title,
//         value: role.id,
//       };
//     });
//   };
// const getManagerArray = async () => {
//   const managerArray = await connection.promisifiedQuery(
//     "select id, concat(first_name, \" \",last_name) as employees from employee"
//   );

//   return managerArray.map((manager) => {
//     return {
//       name: manager.employees,
//       value: manager.manager_id,
//     };
//   });
// };
const getRoleArray = async () => {
  const roleArray = await connection.promisifiedQuery("SELECT * FROM role");

  return roleArray.map((role) => {
    return {
      name: role.title,
      value: role.id,
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
          console.log("Successfully removed role!");
          employeeTrack();
        }
      );
    });
};

const removeEmployee = async () => {
  connection.query(
    'SELECT id, concat(first_name, " ", last_name) as empName FROM employee',
    (err, res) => {
      if (err) throw err;
      const employee0 = res.map((employee) => {
        return {
          name: employee.empName,
          value: employee.id,
        };
      });
      inquirer
        .prompt([
          {
            name: "removeEmployee",
            type: "list",
            message: "Choose an employee to remove:",
            choices: employee0,
          },
        ])
        .then((answers) => {
          connection.query(
            `DELETE FROM employee WHERE id = ${answers.removeEmployee}`,
            (err, data) => {
              if (err) throw err;
              console.log("Successfully removed employee!");
              employeeTrack();
            }
          );
        });
    }
  );
};

const removeDepartments = () => {
  connection.query("SELECT id, name FROM department", (err, res) => {
    if (err) throw err;
    const dept = res.map((department) => {
      return {
        name: department.name,
        value: department.id,
      };
    });
    inquirer
      .prompt([
        {
          name: "removeDepartment",
          type: "list",
          message: "Which department would you like to remove?",
          choices: dept,
        },
      ])
      .then((answers) => {
        connection.query(
          `DELETE FROM department WHERE id = ${answers.removeDepartment}`,
          (err, data) => {
            if (err) throw err;
            console.log("Successfully removed department!");
            employeeTrack();
          }
        );
      });
  });
};

connection.connect((err) => {
  if (err) throw err;
  employeeTrack();
});
