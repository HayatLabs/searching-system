import * as cheerio from 'cheerio';

export interface DiscoveredRoutes {
  contact: string[];
  about: string[];
  portfolio: string[];
}

export class LinkDiscoverer {
  private keywords = {
    contact: [
      'contact', 'contact-us', 'contactus', 'get-in-touch', 'getintouch', 
      'reach-us', 'reachus', 'support', 'help', 'feedback', 'enquiry', 
      'inquiry', 'write-to-us', 'email-us', 'phone', 'call-us', 'location', 
      'address', 'office', 'map', 'locate-us', 'chat', 'hire', 'hire-us', 
      'hireme', 'consult', 'consultation', 'schedule', 'appointment', 'touch'
    ],
    about: [
      'about', 'about-us', 'aboutus', 'bio', 'biography', 'resume', 'cv', 
      'profile', 'who-we-are', 'whoweare', 'team', 'our-team', 'staff', 
      'personnel', 'founders', 'management', 'history', 'our-story', 'story', 
      'company', 'overview', 'philosophy', 'values', 'mission', 'vision', 
      'background', 'experience', 'intro', 'introduction', 'me', 'myself'
    ],
    portfolio: [
      'portfolio', 'projects', 'featured-projects', 'featured', 'services', 
      'what-we-do', 'work', 'our-work', 'case-studies', 'case-study', 
      'gallery', 'showcase', 'client-stories', 'clients', 'testimonials', 
      'products', 'apps', 'products-services', 'designs', 'solutions', 
      'creations', 'achievements', 'publications', 'works', 'skills'
    ]
  };

  public discover(rawHtml: string, baseUrl: string): DiscoveredRoutes {
    if (!rawHtml || typeof rawHtml !== 'string') {
      return { contact: [], about: [], portfolio: [] };
    }

    const $ = cheerio.load(rawHtml);
    const baseDomain = new URL(baseUrl).hostname;

    const contact: string[] = [];
    const about: string[] = [];
    const portfolio: string[] = [];

    // console.log(`[Debug] Checking links on ${baseUrl}`);

    $('a[href]').toArray().forEach((element) => {
      const href = $(element).attr('href');
      if (!href) return;

      try {
        const absoluteUrl = new URL(href, baseUrl);

        if (absoluteUrl.hostname === baseDomain) {
          const urlString = absoluteUrl.toString();
          
          const path = absoluteUrl.pathname.toLowerCase();
          const hash = absoluteUrl.hash.toLowerCase();
          const targetPath = path + hash; 

          const isContact = this.keywords.contact.some((kw) => targetPath.includes(kw));
          if (isContact) {
            contact.push(urlString);
            return;
          }

          const isAbout = this.keywords.about.some((kw) => targetPath.includes(kw));
          if (isAbout) {
            about.push(urlString);
            return;
          }

          const isPortfolio = this.keywords.portfolio.some((kw) => targetPath.includes(kw));
          if (isPortfolio) {
            portfolio.push(urlString);
          }
        }
      } catch {

        // Invalid URL, skip

    }
    });

    return {
      contact: [...new Set(contact)],
      about: [...new Set(about)],
      portfolio: [...new Set(portfolio)]
    };
  }
}