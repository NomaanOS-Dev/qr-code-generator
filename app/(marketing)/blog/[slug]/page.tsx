import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, User } from 'lucide-react'
import { getPost, POSTS } from '@/lib/blog'
import { format } from 'date-fns'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return { title: 'Post not found' }

  return {
    title: `${post.title} — ScanFlow Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = getPost(slug)

  if (!post) notFound()

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/blog">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to blog
        </Link>
      </Button>

      <article>
        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
          <p className="text-lg text-muted-foreground mb-4">
            {post.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {post.author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(post.date), 'MMMM d, yyyy')}
            </span>
          </div>
        </header>

        <div className="prose prose-sm max-w-none space-y-4 text-foreground">
          {post.content.split('\n\n').map((para, i) => {
            if (para.startsWith('## ')) {
              return (
                <h2
                  key={i}
                  className="text-2xl font-bold mt-8 mb-3 text-foreground"
                >
                  {para.replace('## ', '')}
                </h2>
              )
            }
            if (para.startsWith('- ')) {
              const items = para.split('\n').filter((l) => l.startsWith('- '))
              return (
                <ul key={i} className="list-disc pl-6 space-y-1">
                  {items.map((item, j) => (
                    <li key={j} className="text-muted-foreground">
                      {item.replace('- ', '')}
                    </li>
                  ))}
                </ul>
              )
            }
            return (
              <p key={i} className="text-muted-foreground leading-relaxed">
                {para}
              </p>
            )
          })}
        </div>
      </article>

      <div className="mt-12 pt-8 border-t text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Ready to create your own dynamic QR codes?
        </p>
        <Button asChild>
          <Link href="/signup">Start free</Link>
        </Button>
      </div>
    </div>
  )
}