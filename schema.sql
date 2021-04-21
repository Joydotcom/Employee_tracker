DROP DATABASE IF EXISTS employee_DB;
CREATE DATABASE employee_DB;

USE employee_DB;

CREATE TABLE department(
  id INT PRIMARY KEY,
  name VARCHAR(30),
);

CREATE TABLE role(
    id INT PRIMARY KEY,
    title VARCHAR(30),
    salary DECIMAL, 
    department_id INT,
);

CREATE TABLE employee (
    id INT PRIMARY KEY,
    first_name VARCHAR (30),
    last_name VARCHAR(30),
    role_id INT, 
    manager_id INT, 
);


INSERT INTO department (name)
VALUES ("Marketing"),("Sales"), ("Accounting"), ("HR"),("Engineering");

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Joy", "Jackson", 2, 4),("Maya", "Bell", 1, 3),("Mack", "Stevenson", 3, 2),("Karen", "Todd", 4, 2),("Ebony", "Sakari", 5, 3);

INSERT INTO role (title, salary, department_id)
VALUES ("Salesperson", 70000.00, 2),("prManager", 82000.00, 1), ("Accountant", 90000.00, 3), ("HR", 65000.00, 4),("Software Engineer", 100000.00, 5);


-- to get main employee table,name in manager spot not id
select a.first_name, a.last_name, title, department_id, salary, d.concatName
from employee_db.employee a
left join employee_db.role b on a.role_id=b.id
left join employee_db.department c on b.department_id=c.id
left join ( select a.first_name, a.last_name, concat(b.first_name,b.last_name) as concatName, a.manager_id,a.id
from employee_db.employee a
inner join employee_db.employee b on a.manager_id=b.id) d on a.id =d.id

-- to view employees by department
select a.id, a.name, b.first_name, b.last_name, c.title, c.salary, concatName from department a
left join role c on a.id = c.department_id
left join employee b on c.id = b.role_id
left join ( select a.first_name, a.last_name, concat(b.first_name,b.last_name) as concatName, a.manager_id,a.id
from employee_db.employee a
inner join employee_db.employee b on a.manager_id=b.id) d on a.id =d.id


