export class Employee {
    uuid: string;
    name: string;
    pin: string;
    roleUuid: string;
    extraPermissions: string[]; // z.B. ['CAN_EDIT_MENU']
}