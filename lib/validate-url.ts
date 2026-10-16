const BLOCKED_PROTOCOLS = [
  'javascript:',
  'data:',
  'file:',
  'vbscript:',
  'about:',
  'blob:',
]

const BLOCKED_HOSTS = [
  'localhost',       // prevent SSRF to local servers
  '127.0.0.1',
  '0.0.0.0',
  '169.254.169.254', // AWS metadata endpoint
  'metadata.google.internal', // GCP metadata
]

/**
 * Validates a destination URL to prevent abuse.
 * Returns { valid: true } or { valid: false, reason: string }
 */
export function validateDestinationUrl(rawUrl: string): 
  | { valid: true; url: URL } 
  | { valid: false; reason: string } {
  let url: URL

  try {
    url = new URL(rawUrl)
  } catch {
    return { valid: false, reason: 'Invalid URL format' }
  }

  // Block dangerous protocols
  if (BLOCKED_PROTOCOLS.includes(url.protocol)) {
    return { valid: false, reason: `Protocol "${url.protocol}" is not allowed` }
  }

  // Only allow http and https
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return { valid: false, reason: 'Only HTTP and HTTPS URLs are allowed' }
  }

  // Block internal hosts (prevent SSRF)
  const hostname = url.hostname.toLowerCase()
  if (BLOCKED_HOSTS.includes(hostname)) {
    return { valid: false, reason: 'This URL is not allowed' }
  }

  // Block private IP ranges (10.x.x.x, 192.168.x.x, 172.16-31.x.x)
  const ipRegex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
  const match = hostname.match(ipRegex)
  if (match) {
    const [, a, b] = match.map(Number)
    if (
      a === 10 ||
      a === 127 ||
      (a === 192 && b === 168) ||
      (a === 172 && b >= 16 && b <= 31) ||
      a === 0
    ) {
      return { valid: false, reason: 'Private IP addresses are not allowed' }
    }
  }

  return { valid: true, url }
}