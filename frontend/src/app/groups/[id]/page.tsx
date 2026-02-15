import GroupDetailClient from './GroupDetailClient';

export const dynamic = 'force-dynamic';

export default function GroupDetailPage({ params }: { params: { id: string } }) {
    return <GroupDetailClient id={params.id} />;
}
