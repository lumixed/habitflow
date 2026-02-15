import ProfileClient from './ProfileClient';

export const dynamic = 'force-dynamic';

export default function ProfilePage({ params }: { params: { id: string } }) {
    return <ProfileClient id={params.id} />;
}
