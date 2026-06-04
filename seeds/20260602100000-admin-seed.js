'use strict';

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

module.exports = {
    /**
     * Seed initial admin data:
     *   1️⃣ Permissions: users:read, users:write, users:delete, dashboard:read, logs:read
     *   2️⃣ Roles:
     *      - Super Admin (has all above permissions)
     *      - Regular User (no admin permissions)
     *   3️⃣ RolePermissions linking Super Admin ↔ all permissions.
     *   4️⃣ One admin user (email: admin@example.com, password: admin123) attached to Super Admin.
     */
    async up(queryInterface, Sequelize) {
        // -------------------------------------------------------------------------
        // 1️⃣ Insert Permissions
        // -------------------------------------------------------------------------
        const permissionsData = [
            { id: uuidv4(), resource: 'users', action: 'read', createdAt: new Date(), updatedAt: new Date() },
            { id: uuidv4(), resource: 'users', action: 'write', createdAt: new Date(), updatedAt: new Date() },
            { id: uuidv4(), resource: 'users', action: 'delete', createdAt: new Date(), updatedAt: new Date() },
            { id: uuidv4(), resource: 'dashboard', action: 'read', createdAt: new Date(), updatedAt: new Date() },
            { id: uuidv4(), resource: 'logs', action: 'read', createdAt: new Date(), updatedAt: new Date() }
        ];

        await queryInterface.bulkInsert('Permissions', permissionsData, {});

        // -------------------------------------------------------------------------
        // 2️⃣ Insert Roles
        // -------------------------------------------------------------------------
        const superAdminRoleId = uuidv4();
        const regularUserRoleId = uuidv4();

        const rolesData = [
            {
                id: superAdminRoleId,
                name: 'Super Admin',
                description: 'Full access to all admin features',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: regularUserRoleId,
                name: 'Regular User',
                description: 'Limited access, no admin permissions',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        await queryInterface.bulkInsert('Roles', rolesData, {});

        // -------------------------------------------------------------------------
        // 3️⃣ Link Super Admin role with all permissions (RolePermissions)
        // -------------------------------------------------------------------------
        const rolePermissions = permissionsData.map(p => ({
            roleId: superAdminRoleId,
            permissionId: p.id,
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        await queryInterface.bulkInsert('RolePermissions', rolePermissions, {});

        // -------------------------------------------------------------------------
        // 4️⃣ Create a Super Admin user (hashed password)
        // -------------------------------------------------------------------------
        const plainPassword = 'admin123'; // you can change this after seeding
        const hashedPassword = await bcrypt.hash(plainPassword, bcrypt.genSaltSync(12));

        const adminUser = {
            id: uuidv4(),
            fullName: 'Super Admin',
            email: 'admin@example.com',
            password: hashedPassword,
            roleId: superAdminRoleId,
            fcmToken: null,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await queryInterface.bulkInsert('Users', [adminUser], {});
    },

    async down(queryInterface, Sequelize) {
        // Remove data in reverse order to avoid FK constraints
        await queryInterface.bulkDelete('Users', { email: 'admin@example.com' }, {});
        await queryInterface.bulkDelete('RolePermissions', null, {});
        await queryInterface.bulkDelete('Roles', { name: ['Super Admin', 'Regular User'] }, {});
        await queryInterface.bulkDelete('Permissions', {
            [Sequelize.Op.or]: [
                { resource: 'users', action: 'read' },
                { resource: 'users', action: 'write' },
                { resource: 'users', action: 'delete' },
                { resource: 'dashboard', action: 'read' },
                { resource: 'logs', action: 'read' }
            ]
        }, {});
    }
};
