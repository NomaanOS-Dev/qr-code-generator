'use client'

import { useMemo, useState, useTransition, useCallback } from 'react'
import { getQrCodesForDownload } from '@/app/actions/qr'
import { downloadQrBatchAsZip } from '@/lib/qr-batch-download'
import { useRouter } from 'next/navigation'
import {
    useQueryState,
    parseAsString,
    parseAsInteger,
    parseAsStringEnum,
} from 'nuqs'
import { QrCard, type QrCardData } from '@/components/qr/qr-card'
import { EmptyState } from '../ui/empty-state'
import { QrToolbar, type QrStatus, type QrSort, type QrView } from './qr-toolbar'
import { BulkActionsBar } from './bulk-actions-bar'
import { Button } from '@/components/ui/button'
import { QrCode, Plus } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { deleteQrCode, toggleQrCodeActive } from '@/app/actions/qr'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

interface QrDashboardClientProps {
    qrCodes: QrCardData[]
    appUrl: string
}

const PAGE_SIZE = 12

export function QrDashboardClient({ qrCodes, appUrl }: QrDashboardClientProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    // URL-synced state
    const [search, setSearch] = useQueryState(
        'q',
        parseAsString.withDefault('').withOptions({ shallow: false, throttleMs: 300 })
    )
    const [status, setStatus] = useQueryState(
        'status',
        parseAsStringEnum<QrStatus>(['all', 'active', 'inactive']).withDefault('all')
    )
    const [sort, setSort] = useQueryState(
        'sort',
        parseAsStringEnum<QrSort>(['recent', 'oldest', 'name', 'scans']).withDefault(
            'recent'
        )
    )
    const [view, setView] = useQueryState(
        'view',
        parseAsStringEnum<QrView>(['grid', 'list']).withDefault('grid')
    )
    const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))

    // Selection state (local — not synced to URL)
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
    const [isZipping, setIsZipping] = useState(false)

    async function handleBulkDownload() {
        const ids = Array.from(selected)
        if (!ids.length) return

        setIsZipping(true)
        try {
            const result = await getQrCodesForDownload(ids)
            if (result.error) {
                toast.error(result.error)
                return
            }
            if (!result.data || result.data.length === 0) {
                toast.error('No QR codes to download')
                return
            }

            // Filter out nulls to match QrForZip type
            const codesForZip = result.data.map((c) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                foreground_color: c.foreground_color,
                background_color: c.background_color,
                logo_path: c.logo_path,
                margin: c.margin,
                error_correction: c.error_correction,
                logo_size_percent: c.logo_size_percent,
            }))
            await downloadQrBatchAsZip(codesForZip, appUrl)
            toast.success(`Downloaded ${result.data.length} QR codes as ZIP`)
        } catch (err) {
            toast.error((err as Error).message)
        } finally {
            setIsZipping(false)
        }
    }

    // --- Filter + sort + search ---
    const filtered = useMemo(() => {
        let list = [...qrCodes]

        // 1. Search
        if (search.trim()) {
            const q = search.trim().toLowerCase()
            list = list.filter(
                (qr) =>
                    qr.name.toLowerCase().includes(q) ||
                    qr.destination_url.toLowerCase().includes(q) ||
                    qr.slug.toLowerCase().includes(q)
            )
        }

        // 2. Status filter
        if (status === 'active') list = list.filter((qr) => qr.is_active)
        if (status === 'inactive') list = list.filter((qr) => !qr.is_active)

        // 3. Sort
        switch (sort) {
            case 'recent':
                list.sort(
                    (a, b) =>
                        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )
                break
            case 'oldest':
                list.sort(
                    (a, b) =>
                        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                )
                break
            case 'name':
                list.sort((a, b) => a.name.localeCompare(b.name))
                break
            case 'scans':
                list.sort((a, b) => b.scanCount - a.scanCount)
                break
        }

        return list
    }, [qrCodes, search, status, sort])

    // --- Pagination ---
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    const safePage = Math.min(page, totalPages)
    const paginated = useMemo(
        () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
        [filtered, safePage]
    )

    // Reset to page 1 when filters change
    const updateSearch = useCallback(
        (v: string) => {
            setSearch(v)
            setPage(1)
        },
        [setSearch, setPage]
    )
    const updateStatus = useCallback(
        (v: QrStatus) => {
            setStatus(v)
            setPage(1)
        },
        [setStatus, setPage]
    )
    const updateSort = useCallback(
        (v: QrSort) => {
            setSort(v)
            setPage(1)
        },
        [setSort, setPage]
    )

    const hasActiveFilters =
        search.trim() !== '' || status !== 'all' || sort !== 'recent'

    const clearFilters = () => {
        setSearch('')
        setStatus('all')
        setSort('recent')
        setPage(1)
    }

    // --- Selection ---
    function toggleSelect(id: string, isSelected: boolean) {
        setSelected((prev) => {
            const next = new Set(prev)
            if (isSelected) next.add(id)
            else next.delete(id)
            return next
        })
    }

    function selectAllOnPage() {
        const next = new Set(selected)
        paginated.forEach((qr) => next.add(qr.id))
        setSelected(next)
    }

    function clearSelection() {
        setSelected(new Set())
    }

    // --- Bulk actions ---
    function handleBulkToggle(isActive: boolean) {
        const ids = Array.from(selected)
        startTransition(async () => {
            let completed = 0

            for (const id of ids) {
                const result = await toggleQrCodeActive(id, isActive)
                if (result.error) {
                    toast.error(result.error)
                    return
                }
                completed += 1
            }

            toast.success(
                `${completed} ${completed === 1 ? 'code' : 'codes'} ${isActive ? 'activated' : 'deactivated'
                }`
            )
            clearSelection()
            router.refresh()
        })
    }

    function handleBulkDelete() {
        const ids = Array.from(selected)
        startTransition(async () => {
            let completed = 0

            for (const id of ids) {
                const result = await deleteQrCode(id)
                if (result.error) {
                    toast.error(result.error)
                    return
                }
                completed += 1
            }

            toast.success(
                `${completed} ${completed === 1 ? 'code' : 'codes'} deleted`
            )
            clearSelection()
            setBulkDeleteOpen(false)
            router.refresh()
        })
    }

    // --- Row actions ---
    function handleToggleOne(id: string, isActive: boolean) {
        startTransition(async () => {
            const result = await toggleQrCodeActive(id, isActive)
            if (result.error) {
                toast.error(result.error)
                return
            }
            toast.success(isActive ? 'QR code activated' : 'QR code deactivated')
            router.refresh()
        })
    }

    function handleDeleteOne(id: string, name: string) {
        setDeleteId(id)
    }

    function confirmDeleteOne() {
        if (!deleteId) return
        startTransition(async () => {
            const result = await deleteQrCode(deleteId)
            if (result.error) {
                toast.error(result.error)
                return
            }
            toast.success('QR code deleted')
            setDeleteId(null)
            setSelected((prev) => {
                const next = new Set(prev)
                next.delete(deleteId)
                return next
            })
            router.refresh()
        })
    }

    // --- Empty state: no QR codes at all ---
    if (qrCodes.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">My QR Codes</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage and track all your dynamic QR codes
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/dashboard/create">
                            <Plus className="h-4 w-4 mr-2" />
                            Create QR Code
                        </Link>
                    </Button>
                </div>

                <EmptyState
                    icon={QrCode}
                    title="No QR codes yet"
                    description="Create your first dynamic QR code to get started. You can change the destination anytime without reprinting."
                    actionLabel="Create your first QR code"
                    actionHref="/dashboard/create"
                    secondaryActionLabel="Browse templates"
                    secondaryActionHref="/dashboard/templates"
                />
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold">My QR Codes</h1>
                    <p className="text-muted-foreground mt-1">
                        {qrCodes.length} {qrCodes.length === 1 ? 'code' : 'codes'} · Manage
                        and track all your dynamic QR codes
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/create">
                        <Plus className="h-4 w-4 mr-2" />
                        Create QR Code
                    </Link>
                </Button>
            </div>

            {/* Toolbar */}
            <QrToolbar
                search={search}
                onSearchChange={updateSearch}
                status={status}
                onStatusChange={updateStatus}
                sort={sort}
                onSortChange={updateSort}
                view={view}
                onViewChange={setView}
                totalCount={qrCodes.length}
                filteredCount={filtered.length}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={clearFilters}
            />

            {/* Selection helpers (only when items on page) */}
            {paginated.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <button
                        type="button"
                        className="hover:text-foreground transition-colors"
                        onClick={selectAllOnPage}
                    >
                        Select all on page
                    </button>
                    {selected.size > 0 && (
                        <>
                            <span>·</span>
                            <button
                                type="button"
                                className="hover:text-foreground transition-colors"
                                onClick={clearSelection}
                            >
                                Clear selection
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Results or empty-filter state */}
            {filtered.length === 0 ? (
                <div className="border-2 border-dashed rounded-lg p-12 text-center">
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center mx-auto mb-4">
                        <QrCode className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">No matching QR codes</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Try adjusting your search or filters.
                    </p>
                    <Button variant="outline" onClick={clearFilters}>
                        Clear filters
                    </Button>
                </div>
            ) : (
                <>
                    {/* Grid or List */}
                    <div
                        className={
                            view === 'grid'
                                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                                : 'space-y-3'
                        }
                    >
                        {paginated.map((qr) => (
                            <QrCard
                                key={qr.id}
                                qr={qr}
                                appUrl={appUrl}
                                view={view}
                                selected={selected.has(qr.id)}
                                onSelectChange={(s) => toggleSelect(qr.id, s)}
                                onToggleActive={handleToggleOne}
                                onDelete={handleDeleteOne}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={safePage <= 1}
                                onClick={() => setPage(safePage - 1)}
                            >
                                Previous
                            </Button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <Button
                                        key={p}
                                        variant={p === safePage ? 'default' : 'ghost'}
                                        size="sm"
                                        className="min-w-9"
                                        onClick={() => setPage(p)}
                                    >
                                        {p}
                                    </Button>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={safePage >= totalPages}
                                onClick={() => setPage(safePage + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </>
            )}

            {/* Bulk action bar */}
            <BulkActionsBar
                count={selected.size}
                isPending={isPending}
                isZipping={isZipping}
                onActivate={() => handleBulkToggle(true)}
                onDeactivate={() => handleBulkToggle(false)}
                onDelete={() => setBulkDeleteOpen(true)}
                onDownloadZip={handleBulkDownload}
                onClear={clearSelection}
            />

            {/* Delete single QR dialog */}
            <Dialog open={Boolean(deleteId)} onOpenChange={(o) => !o && setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete this QR code?</DialogTitle>
                        <DialogDescription>
                            This will permanently delete the QR code and all its scan data.
                            Printed codes will stop working.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteId(null)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDeleteOne}
                            disabled={isPending}
                        >
                            Yes, delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk delete dialog */}
            <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Delete {selected.size}{' '}
                            {selected.size === 1 ? 'QR code' : 'QR codes'}?
                        </DialogTitle>
                        <DialogDescription>
                            This will permanently delete the selected QR codes and all their
                            scan data. Printed codes will stop working. This action cannot be
                            undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setBulkDeleteOpen(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleBulkDelete}
                            disabled={isPending}
                        >
                            Yes, delete all
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}