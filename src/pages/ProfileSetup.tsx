import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Shield } from 'lucide-react';

const ProfileSetup = () => {
  const [params] = useSearchParams();
  const role = params.get('role') || 'worker';
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');

  const dashboardPath = role === 'poster' ? '/poster/dashboard' : '/verification';

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link to="/" className="mb-4 inline-flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-heading text-xl font-bold">TaskVerified</span>
          </Link>
          <h1 className="mt-4 font-heading text-2xl font-bold">Set up your profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">Tell us a bit about yourself</p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" placeholder="What do you do? What are you good at?" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" placeholder="City, Country" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <Link to={dashboardPath}>
            <Button className="w-full" size="lg">Continue</Button>
          </Link>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
