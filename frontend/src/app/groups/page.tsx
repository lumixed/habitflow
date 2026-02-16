'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGroups } from '@/hooks/useGroups';
import Navbar from '@/components/Navbar';

export default function GroupsPage() {
    const router = useRouter();
    const { user, isLoading: authLoading, logout } = useAuth();
    const { groups, isLoading, createGroup, joinGroup } = useGroups();

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'join'>('create');
    const [formData, setFormData] = useState({ name: '', description: '', invite_code: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
        }
    }, [user, authLoading, router]);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const openCreateModal = () => {
        setModalMode('create');
        setFormData({ name: '', description: '', invite_code: '' });
        setError('');
        setShowModal(true);
    };

    const openJoinModal = () => {
        setModalMode('join');
        setFormData({ name: '', description: '', invite_code: '' });
        setError('');
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            if (modalMode === 'create') {
                await createGroup(formData.name, formData.description);
            } else {
                await joinGroup(formData.invite_code);
            }
            setShowModal(false);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-neutral-400">Loading...</div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-neutral-50">
            <Navbar />

            {/* Main */}
            <main className="max-w-2xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900">Groups</h2>
                        <p className="text-sm text-neutral-500 mt-0.5">
                            {groups.length} {groups.length === 1 ? 'group' : 'groups'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={openJoinModal}
                            className="px-4 py-2.5 border border-neutral-300 text-neutral-700 text-sm font-semibold rounded-xl hover:bg-neutral-100 transition-colors"
                        >
                            Join Group
                        </button>
                        <button
                            onClick={openCreateModal}
                            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Group
                        </button>
                    </div>
                </div>

                {/* Empty state */}
                {!isLoading && groups.length === 0 && (
                    <div className="text-center py-20 px-6">
                        <div className="mb-4">
                            <Users size={40} className="text-neutral-300 mx-auto" />
                        </div>
                        <h3 className="text-lg font-semibold text-neutral-800 mb-2">No groups yet</h3>
                        <p className="text-neutral-500 mb-6 max-w-sm mx-auto">
                            Create or join a group to stay accountable with friends.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={openCreateModal}
                                className="px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors"
                            >
                                Create a group
                            </button>
                            <button
                                onClick={openJoinModal}
                                className="px-5 py-2.5 border border-neutral-300 text-neutral-700 text-sm font-semibold rounded-xl hover:bg-neutral-100 transition-colors"
                            >
                                Join with code
                            </button>
                        </div>
                    </div>
                )}

                {/* Loading */}
                {isLoading && (
                    <div className="space-y-3">
                        {[1, 2].map((i) => (
                            <div key={i} className="h-24 bg-white rounded-xl border border-neutral-200 animate-pulse" />
                        ))}
                    </div>
                )}

                {/* Groups list */}
                {!isLoading && groups.length > 0 && (
                    <div className="space-y-3">
                        {groups.map((group) => (
                            <Link
                                key={group.id}
                                href={`/groups/${group.id}`}
                                className="block bg-white rounded-xl border border-neutral-200 p-4 hover:border-primary-300 hover:shadow-sm transition-all"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-neutral-900">{group.name}</h3>
                                        {group.description && (
                                            <p className="text-sm text-neutral-500 mt-0.5">{group.description}</p>
                                        )}
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-xs text-neutral-400">
                                                {group.member_count} {group.member_count === 1 ? 'member' : 'members'}
                                            </span>
                                            {group.role === 'OWNER' && (
                                                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">
                                                    Owner
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>

            {/* Modal */}
            {showModal && (
                <>
                    <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={() => setShowModal(false)} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                            <div className="flex items-center justify-between p-6 pb-4">
                                <h2 className="text-lg font-bold text-neutral-900">
                                    {modalMode === 'create' ? 'Create a group' : 'Join a group'}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
                                {modalMode === 'create' ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Group name</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                                placeholder="e.g. Morning Routine Club"
                                                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                                Description <span className="text-neutral-400 font-normal">(optional)</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="What's this group about?"
                                                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Invite code</label>
                                        <input
                                            type="text"
                                            value={formData.invite_code}
                                            onChange={(e) => setFormData({ ...formData, invite_code: e.target.value })}
                                            required
                                            placeholder="Enter 6-character code"
                                            className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                                        />
                                    </div>
                                )}

                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isSubmitting ? (modalMode === 'create' ? 'Creating...' : 'Joining...') : modalMode === 'create' ? 'Create group' : 'Join group'}
                                </button>
                            </form>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
