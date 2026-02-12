import React, { useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import './RolesManagement.css';

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
}

const RolesManagement: React.FC = () => {
  const [roles] = useState<Role[]>([
    { id: '1', name: 'Admin', description: 'Full system access', userCount: 2 },
    { id: '2', name: 'Manager', description: 'Manage users and content', userCount: 5 },
    { id: '3', name: 'Coach', description: 'Manage own clients and content', userCount: 12 },
    { id: '4', name: 'Client', description: 'View own content only', userCount: 156 },
  ]);

  const permissions = [
    { category: 'Dashboard', items: ['View Revenue', 'View Analytics'] },
    { category: 'Clients', items: ['View', 'Create', 'Edit', 'Delete', 'Assign Coach'] },
    { category: 'Coaches', items: ['View', 'Create', 'Edit', 'Delete', 'Manage Availability'] },
    { category: 'Templates', items: ['View', 'Create', 'Edit', 'Delete', 'Assign'] },
    { category: 'Calendar', items: ['View All', 'Create', 'Edit', 'Delete'] },
    { category: 'Roles', items: ['View', 'Create', 'Edit', 'Delete', 'Assign'] },
  ];

  return (
    <div className="roles-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Roles Management</h1>
        </div>
        <Button variant="primary">+ Create Role</Button>
      </div>

      <div className="roles-grid">
        {roles.map((role) => (
          <Card key={role.id} className="role-card">
            <div className="role-header">
              <h3>{role.name}</h3>
              <span className="user-count">{role.userCount} users</span>
            </div>
            <p className="role-description">{role.description}</p>
            <Button variant="ghost" size="small">
              Edit Permissions
            </Button>
          </Card>
        ))}
      </div>

      <Card title="Permission Matrix" subtitle="Default permissions for each role">
        <div className="permission-matrix">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Admin</th>
                <th>Manager</th>
                <th>Coach</th>
                <th>Client</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((category) => (
                <tr key={category.category}>
                  <td className="category-name">{category.category}</td>
                  <td>
                    <span className="permission-badge all">All</span>
                  </td>
                  <td>
                    <span className="permission-badge most">Most</span>
                  </td>
                  <td>
                    <span className="permission-badge some">Some</span>
                  </td>
                  <td>
                    <span className="permission-badge limited">Limited</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default RolesManagement;
