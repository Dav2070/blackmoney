import { Component } from '@angular/core';
import { Employee } from 'src/app/models/Employee';
import { Role } from 'src/app/models/Role';

@Component({
  selector: 'app-employee-management',
  templateUrl: './employee-management.component.html',
  styleUrl: './employee-management.component.scss',
  standalone: false
})
export class EmployeeManagementComponent {
  ALL_PERMISSIONS = [
    { code: 'CAN_EDIT_MENU', label: 'Menü bearbeiten' },
    { code: 'CAN_VIEW_REPORTS', label: 'Berichte einsehen' },
    { code: 'CAN_MANAGE_EMPLOYEES', label: 'Mitarbeiter verwalten' },
  ];

  employees: Employee[] = [];
  roles: Role[] = [];
  selectedEmployee: Employee | null = null;

  // Für neue und bearbeitete Mitarbeiter/Rollen
  newEmployeeName = '';
  newEmployeePin = '';
  newEmployeeRoleUuid = '';
  newRoleName = '';
  newRolePermissions: string[] = [];

  editRole: Role | null = null;
  editRoleName = '';
  editRolePermissions: string[] = [];

  editEmployee: Employee | null = null;
  editEmployeeName = '';
  editEmployeePin = '';
  editEmployeeRoleUuid = '';
  editEmployeeExtraPermissions: string[] = [];

  // Rollenverwaltung
  addRole() {
    if (!this.newRoleName.trim()) return;
    this.roles.push({
      uuid: crypto.randomUUID(),
      name: this.newRoleName.trim(),
      permissions: [...this.newRolePermissions]
    });
    this.newRoleName = '';
    this.newRolePermissions = [];
  }

  startEditRole(role: Role) {
    this.editRole = role;
    this.editRoleName = role.name;
    this.editRolePermissions = [...role.permissions];
  }

  saveEditRole() {
    if (this.editRole && this.editRoleName.trim()) {
      this.editRole.name = this.editRoleName.trim();
      this.editRole.permissions = [...this.editRolePermissions];
      this.editRole = null;
    }
  }

  cancelEditRole() {
    this.editRole = null;
  }

  deleteRole(role: Role) {
    this.roles = this.roles.filter(r => r !== role);
    this.employees.forEach(e => {
      if (e.roleUuid === role.uuid) e.roleUuid = '';
    });
    if (this.editRole === role) this.editRole = null;
  }

  // Mitarbeiterverwaltung
  addEmployee() {
    if (!this.newEmployeeName.trim() || !this.newEmployeePin.trim() || !this.newEmployeeRoleUuid) return;
    this.employees.push({
      uuid: crypto.randomUUID(),
      name: this.newEmployeeName.trim(),
      pin: this.newEmployeePin,
      roleUuid: this.newEmployeeRoleUuid,
      extraPermissions: []
    });
    this.newEmployeeName = '';
    this.newEmployeePin = '';
    this.newEmployeeRoleUuid = '';
  }

  startEditEmployee(emp: Employee) {
    this.editEmployee = emp;
    this.editEmployeeName = emp.name;
    this.editEmployeePin = emp.pin;
    this.editEmployeeRoleUuid = emp.roleUuid;
    this.editEmployeeExtraPermissions = [...emp.extraPermissions];
  }

  saveEditEmployee() {
    if (this.editEmployee && this.editEmployeeName.trim() && this.editEmployeePin.trim() && this.editEmployeeRoleUuid) {
      this.editEmployee.name = this.editEmployeeName.trim();
      this.editEmployee.pin = this.editEmployeePin;
      this.editEmployee.roleUuid = this.editEmployeeRoleUuid;
      this.editEmployee.extraPermissions = [...this.editEmployeeExtraPermissions];
      this.editEmployee = null;
    }
  }

  cancelEditEmployee() {
    this.editEmployee = null;
  }

  deleteEmployee(emp: Employee) {
    this.employees = this.employees.filter(e => e !== emp);
    if (this.selectedEmployee === emp) this.selectedEmployee = null;
    if (this.editEmployee === emp) this.editEmployee = null;
  }

  selectEmployee(emp: Employee) {
    this.selectedEmployee = emp;
  }

  getRole(roleUuid: string): Role | undefined {
    return this.roles.find(r => r.uuid === roleUuid);
  }

  // Rechte pro Mitarbeiter anpassen
  togglePermission(emp: Employee, perm: string) {
    if (!emp) return;
    if (emp.extraPermissions.includes(perm)) {
      emp.extraPermissions = emp.extraPermissions.filter(p => p !== perm);
    } else {
      emp.extraPermissions.push(perm);
    }
  }

  hasPermission(emp: Employee, perm: string): boolean {
    const role = this.getRole(emp.roleUuid);
    return (role?.permissions.includes(perm) ?? false) || emp.extraPermissions.includes(perm);
  }

  getPermissionLabel(code: string): string {
    return this.ALL_PERMISSIONS.find(p => p.code === code)?.label || code;
  }
}
