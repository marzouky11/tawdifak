import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-config';
 
export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_URL;
  return {
    rules: [
        {
            userAgent: '*',
            allow: '/',
            disallow: [
              '/admin',
              '/admin/',
              '/api/',
              '/edit-job/',
              '/edit-immigration/',
              '/edit-competition/',
              '/edit-testimonial/',
              '/profile',
              '/profile/',
              '/workers/',
            ],
        }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
