'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
    addDomain,
    verifyDomain,
    deleteDomain,
} from '@/app/actions/domains'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/components/ui/alert'
import { toast } from 'sonner'
import { format } from 'date-fns'
import {
    Globe,
    Plus,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Clock,
    Copy,
    Trash2,
    RefreshCw,
    ExternalLink,
    Info,
} from 'lucide-react'
import {
    normalizeDomain,
    getDnsRecordForDomain,
    DOMAIN_STATUS_LABELS,
    DOMAIN_STATUS_COLORS,
    type CustomDomain,
    type DomainStatus,
} from '@/types/domains'
import type { WorkspaceWithMembership } from '@/types/workspaces'
import { cn } from '@/lib/utils'

interface DomainsClientProps {
    workspace: WorkspaceWithMembership
    domains: CustomDomain[]
    canManage: boolean
}

function StatusBadge({ status }: { status: DomainStatus }) {
    const Icon =
        status === 'verified'
            ? CheckCircle2
            : status === 'failed'
                ? AlertCircle
                : status === 'verifying'
                    ? Loader2
                    : Clock

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium',
                DOMAIN_STATUS_COLORS[status]
            )}
        >
            <Icon
                className={cn('h-3.5 w-3.5', status === 'verifying' && 'animate-spin')}
            />
            {DOMAIN_STATUS_LABELS[status]}
        </span>
    )
}

export function DomainsClient({
    workspace,
    domains,
    canManage,
}: DomainsClientProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    // Add dialog state
    const [addOpen, setAddOpen] = useState(false)
    const [newDomain, setNewDomain] = useState('')
    const [adding, setAdding] = useState(false)

    // Verify state
    const [verifyingId, setVerifyingId] = useState<string | null>(null)

    // Delete state
    const [deleteId, setDeleteId] = useState<string | null>(null)

    // Setup info dialog
    const [setupDomain, setSetupDomain] = useState<CustomDomain | null>(null)

    function handleAdd() {
        const normalized = normalizeDomain(newDomain)
        if (!normalized) {
            toast.error('Please enter a domain')
            return
        }

        setAdding(true)
        startTransition(async () => {
            const result = await addDomain(normalized)
            setAdding(false)
            if (result.error) {
                toast.error(result.error)
                return
            }
            toast.success('Domain added')
            setAddOpen(false)
            setNewDomain('')
            router.refresh()
        })
    }

    function handleVerify(domainId: string) {
        setVerifyingId(domainId)
        startTransition(async () => {
            const result = await verifyDomain(domainId)
            setVerifyingId(null)
            if (result.verified) {
                toast.success('Domain verified!')
                router.refresh()
                return
            }
            toast.error(result.error ?? 'Verification failed')
            router.refresh()
        })
    }

    function handleDelete(domainId: string) {
        startTransition(async () => {
            const result = await deleteDomain(domainId)
            if (result.error) {
                toast.error(result.error)
                return
            }
            toast.success('Domain deleted')
            setDeleteId(null)
            router.refresh()
        })
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-bold">Custom Domains</h1>
                    <p className="text-muted-foreground mt-1">
                        Serve QR codes from your own domain in {workspace.name}.
                    </p>
                </div>
                {canManage && (
                    <Button onClick={() => setAddOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add domain
                    </Button>
                )}
            </div>

            {/* Alert for empty state */}
            {domains.length === 0 && (
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>No custom domains yet</AlertTitle>
                    <AlertDescription>
                        Add your own domain (e.g., <code>go.myrestaurant.com</code>) to serve
                        QR codes from it. You&apos;ll need access to your DNS provider (like
                        Cloudflare, GoDaddy, Namecheap).
                    </AlertDescription>
                </Alert>
            )}

            {/* Domains list */}
            {domains.map((domain) => {
                const record = getDnsRecordForDomain(domain.domain)
                return (
                    <Card key={domain.id}>
                        <CardHeader className="flex flex-row items-start justify-between space-y-0">
                            <div className="flex items-start gap-3">
                                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <Globe className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                                        {domain.domain}
                                        <StatusBadge status={domain.status} />
                                    </CardTitle>
                                    <CardDescription className="mt-1">
                                        Added{' '}
                                        {domain.created_at
                                            ? format(new Date(domain.created_at), 'MMM d, yyyy')
                                            : 'recently'}
                                        {domain.verified_at && (
                                            <>
                                                {' · '}
                                                Verified{' '}
                                                {format(new Date(domain.verified_at), 'MMM d, yyyy')}
                                            </>
                                        )}
                                    </CardDescription>
                                </div>
                            </div>
                            {canManage && (
                                <div className="flex gap-1 shrink-0">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setSetupDomain(domain)}
                                        title="Setup instructions"
                                    >
                                        <Info className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost"
                                        size="icon"
                                        onClick={() => setDeleteId(domain.id)}
                                        title="Delete domain"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* DNS record table */}
                            <div className="rounded-md border overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="text-left px-3 py-2 font-medium">Type</th>
                                            <th className="text-left px-3 py-2 font-medium">Host</th>
                                            <th className="text-left px-3 py-2 font-medium">
                                                Value
                                            </th>
                                            <th className="text-left px-3 py-2 font-medium">TTL</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-t">
                                            <td className="px-3 py-2 font-mono">{record.type}</td>
                                            <td className="px-3 py-2 font-mono">{record.host}</td>
                                            <td className="px-3 py-2 font-mono text-xs truncate max-w-[200px]">
                                                {record.value}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 ml-1"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(record.value)
                                                        toast.success('Copied')
                                                    }}
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </td>
                                            <td className="px-3 py-2 font-mono">{record.ttl}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Error message */}
                            {domain.status === 'failed' && domain.verification_error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Verification failed</AlertTitle>
                                    <AlertDescription className="text-sm">
                                        {domain.verification_error}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2">
                                {domain.status !== 'verified' && canManage && (
                                    <Button
                                        size="sm"
                                        onClick={() => handleVerify(domain.id)}
                                        disabled={verifyingId === domain.id || isPending}
                                    >
                                        {verifyingId === domain.id ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Verifying…
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                Verify DNS
                                            </>
                                        )}
                                    </Button>
                                )}
                                {domain.status === 'verified' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                    >
                                        <a
                                            href={`https://${domain.domain}/r/test`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            Test domain
                                        </a>
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSetupDomain(domain)}
                                >
                                    Setup instructions
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}

            {/* Add domain dialog */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add a custom domain</DialogTitle>
                        <DialogDescription>
                            Enter a domain you own and can manage DNS for. You&apos;ll add a
                            CNAME record after this step.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                        <Label htmlFor="new-domain">Domain</Label>
                        <Input
                            id="new-domain"
                            value={newDomain}
                            onChange={(e) => setNewDomain(e.target.value)}
                            placeholder="go.myrestaurant.com"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleAdd()
                                }
                            }}
                        />
                        <p className="text-xs text-muted-foreground">
                            Use a subdomain like <code>go.yourdomain.com</code> or{' '}
                            <code>qr.yourdomain.com</code>. Root domains work but may need
                            provider-specific setup.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setAddOpen(false)}
                            disabled={adding}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleAdd} disabled={adding || !newDomain.trim()}>
                            {adding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Add domain
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Setup instructions dialog */}
            <Dialog
                open={Boolean(setupDomain)}
                onOpenChange={(o) => !o && setSetupDomain(null)}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Setup instructions</DialogTitle>
                        <DialogDescription>
                            Add these DNS records at your domain provider.
                        </DialogDescription>
                    </DialogHeader>
                    {setupDomain && (
                        <div className="space-y-4 text-sm">
                            <div>
                                <p className="font-medium mb-1">Step 1 — Add a CNAME record</p>
                                <div className="rounded-md bg-muted p-3 font-mono text-xs space-y-1">
                                    <p>Type: CNAME</p>
                                    <p>Host: {getDnsRecordForDomain(setupDomain.domain).host}</p>
                                    <p>Value: {getDnsRecordForDomain(setupDomain.domain).value}</p>
                                    <p>TTL: Auto</p>
                                </div>
                            </div>
                            <div>
                                <p className="font-medium mb-1">Step 2 — Wait 5–60 minutes</p>
                                <p className="text-muted-foreground">
                                    DNS propagation takes time. If verification fails initially,
                                    wait 15 minutes and try again.
                                </p>
                            </div>
                            <div>
                                <p className="font-medium mb-1">Step 3 — Verify</p>
                                <p className="text-muted-foreground">
                                    Click <strong>Verify DNS</strong> on the domain card. Once
                                    verified, any QR code in this workspace can use this domain.
                                </p>
                            </div>
                            <div>
                                <p className="font-medium mb-1">Step 4 — Use it on QR codes</p>
                                <p className="text-muted-foreground">
                                    Go to any QR code&apos;s detail page and select this domain
                                    from the &ldquo;Custom domain&rdquo; dropdown.
                                </p>
                            </div>
                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    SSL certificates are provisioned automatically within 24
                                    hours of successful DNS verification.
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setSetupDomain(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete dialog */}
            <Dialog open={Boolean(deleteId)} onOpenChange={(o) => !o && setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete this domain?</DialogTitle>
                        <DialogDescription>
                            QR codes using this domain will fall back to the default domain.
                            Printed QR codes that already encode the custom domain will stop
                            working.
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
                            onClick={() => deleteId && handleDelete(deleteId)}
                            disabled={isPending}
                        >
                            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Delete domain
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}