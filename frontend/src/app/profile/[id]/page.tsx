import ProfileClient from './ProfileClient';

export const dynamicParams = false;

export function generateStaticParams() {
    return [{ id: '1' }];
}


export default function ProfilePage({ params }: { params: { id: string } }) {
    return <ProfileClient id={params.id} />;
}
