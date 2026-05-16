import { Card, Input } from '../components/index.js';

export const ProfilePage = () => (
  <div className="page">
    <header className="page-header">
      <div>
        <p className="eyebrow">Account</p>
        <h1>Profile</h1>
      </div>
    </header>
    <Card>
      <form className="profile-form">
        <Input id="name" label="Name" placeholder="Patient name" />
        <Input id="bio" label="Bio" placeholder="Short clinical context" />
      </form>
    </Card>
  </div>
);
