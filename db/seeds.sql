-- Insert departments
INSERT INTO department (name) VALUES
  ('Sales'),
  ('Engineering'),
  ('Finance'),
  ('Human Resources');

-- Insert roles
INSERT INTO role (title, salary, department_id) VALUES
  ('Sales Associate', 50000.00, 1),
  ('Software Engineer', 80000.00, 2),
  ('Financial Analyst', 60000.00, 3),
  ('HR Coordinator', 45000.00, 4);

-- Insert employees
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
  ('John', 'Chewning', 1, NULL),
  ('Hannah', 'Smith', 2, 1),
  ('Bob', 'Turner', 3, 1),
  ('Nicholas', 'Williams', 4, NULL);
