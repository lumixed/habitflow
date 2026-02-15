import GroupDetailClient from './GroupDetailClient';

export const dynamicParams = false;

export function generateStaticParams() {
    return [{ id: '1' }];
}


export default function GroupDetailPage({ params }: { params: { id: string } }) {
    return <GroupDetailClient id={params.id} />;
}
