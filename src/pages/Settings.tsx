import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

const Settings = () => {
  const [name, setName] = useState('Alex Rivera');
  const [email] = useState('alex@example.com');
  const [emailNotifs, setEmailNotifs] = useState(true);

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="mb-2 font-heading text-2xl font-bold">Settings</h1>
      <p className="mb-8 text-muted-foreground">Manage your account and preferences.</p>

      <div className="space-y-8">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 font-heading text-base font-semibold">Account</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={email} disabled />
              <p className="mt-1 text-xs text-muted-foreground">Contact support to change your email.</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 font-heading text-base font-semibold">Notifications</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email notifications</p>
              <p className="text-xs text-muted-foreground">Get notified about task updates and payouts</p>
            </div>
            <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 font-heading text-base font-semibold">Payout Settings</h2>
          <p className="text-sm text-muted-foreground">Payout method configuration coming soon.</p>
        </div>

        <div className="flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
