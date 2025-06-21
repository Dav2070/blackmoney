export class Role {
    uuid: string;
    name: string;
    permissions: string[]; // z.B. ['CAN_EDIT_MENU', 'CAN_VIEW_REPORTS']
}