/**
 * Direct Resource Scraper - Finds REAL resources from actual websites
 * Uses axios + cheerio for web scraping - NO API KEYS NEEDED
 */

import axios from "axios";
import * as cheerio from "cheerio";
import { getFromCache, setToCache } from "../redis";

type Resource = {
    title: string;
    url: string;
    type: "video" | "article" | "documentation" | "exercise" | "project";
    source: string;
    thumbnail?: string;
};

// User agent to avoid being blocked
const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/**
 * Scrape YouTube search results directly (no API key needed)
 */
async function scrapeYouTube(query: string, maxResults: number = 3): Promise<Resource[]> {
    try {
        const encodedQuery = encodeURIComponent(`${query} tutorial`);
        const url = `https://www.youtube.com/results?search_query=${encodedQuery}`;
        
        const response = await axios.get(url, {
            headers: { "User-Agent": USER_AGENT },
            timeout: 10000,
        });

        const html = response.data as string;
        
        // Extract video data from ytInitialData JSON
        const ytDataMatch = html.match(/var ytInitialData = (.+?);<\/script>/);
        if (!ytDataMatch) return [];

        const ytData = JSON.parse(ytDataMatch[1]);
        const contents = ytData?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];

        const videos: Resource[] = [];
        for (const item of contents) {
            if (videos.length >= maxResults) break;
            
            const videoRenderer = item.videoRenderer;
            if (!videoRenderer) continue;

            const videoId = videoRenderer.videoId;
            const title = videoRenderer.title?.runs?.[0]?.text || "";
            
            if (videoId && title) {
                videos.push({
                    title: title.substring(0, 100),
                    url: `https://www.youtube.com/watch?v=${videoId}`,
                    type: "video",
                    source: "YouTube",
                    thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
                });
            }
        }

        return videos;
    } catch (error) {
        console.log(`YouTube scrape warning: ${error instanceof Error ? error.message : "Failed"}`);
        return [];
    }
}

/**
 * Scrape Dev.to articles (they have a public API, no key needed)
 */
async function scrapeDevTo(query: string, maxResults: number = 3): Promise<Resource[]> {
    try {
        // Dev.to has a free public API
        const encodedQuery = encodeURIComponent(query);
        const url = `https://dev.to/api/articles?per_page=${maxResults}&tag=${encodedQuery}`;
        
        const response = await axios.get(url, {
            headers: { "User-Agent": USER_AGENT },
            timeout: 8000,
        });

        const articles = response.data as Array<{
            title: string;
            url: string;
            cover_image?: string;
        }>;

        return articles.slice(0, maxResults).map((article) => ({
            title: article.title,
            url: article.url,
            type: "article" as const,
            source: "Dev.to",
            thumbnail: article.cover_image,
        }));
    } catch {
        // Fallback: search by general term
        try {
            const url = `https://dev.to/api/articles?per_page=${maxResults}&top=7`;
            const response = await axios.get(url, { timeout: 8000 });
            const articles = response.data as Array<{ title: string; url: string }>;
            return articles.slice(0, maxResults).map((a) => ({
                title: a.title,
                url: a.url,
                type: "article" as const,
                source: "Dev.to",
            }));
        } catch {
            return [];
        }
    }
}

/**
 * Scrape GeeksforGeeks articles
 */
async function scrapeGeeksForGeeks(query: string, maxResults: number = 2): Promise<Resource[]> {
    try {
        const encodedQuery = encodeURIComponent(query.replace(/\s+/g, "-").toLowerCase());
        const searchUrl = `https://www.geeksforgeeks.org/search/${encodedQuery}/`;
        
        const response = await axios.get(searchUrl, {
            headers: { "User-Agent": USER_AGENT },
            timeout: 10000,
        });

        const $ = cheerio.load(response.data as string);
        const articles: Resource[] = [];

        // GFG search results
        $("article a, .head a, .entry-title a").each((_, el) => {
            if (articles.length >= maxResults) return false;
            
            const $el = $(el);
            const href = $el.attr("href");
            const title = $el.text().trim();
            
            if (href && title && href.includes("geeksforgeeks.org")) {
                articles.push({
                    title: title.substring(0, 100),
                    url: href,
                    type: "article",
                    source: "GeeksforGeeks",
                });
            }
        });

        return articles;
    } catch {
        // Return hardcoded popular GFG resources as fallback
        return [{
            title: `${query} - GeeksforGeeks`,
            url: `https://www.geeksforgeeks.org/${query.toLowerCase().replace(/\s+/g, "-")}/`,
            type: "article" as const,
            source: "GeeksforGeeks",
        }].slice(0, maxResults);
    }
}

/**
 * Scrape Medium articles via DuckDuckGo HTML search (no API key)
 */
async function scrapeMedium(query: string, maxResults: number = 2): Promise<Resource[]> {
    try {
        // Use DuckDuckGo HTML search for Medium articles
        const encodedQuery = encodeURIComponent(`site:medium.com ${query}`);
        const url = `https://html.duckduckgo.com/html/?q=${encodedQuery}`;
        
        const response = await axios.get(url, {
            headers: { "User-Agent": USER_AGENT },
            timeout: 10000,
        });

        const $ = cheerio.load(response.data as string);
        const articles: Resource[] = [];

        $(".result__a").each((_, el) => {
            if (articles.length >= maxResults) return false;
            
            const $el = $(el);
            const href = $el.attr("href");
            const title = $el.text().trim();
            
            if (href && title && href.includes("medium.com")) {
                // DuckDuckGo redirects, extract actual URL
                const actualUrl = new URL(href, "https://duckduckgo.com").searchParams.get("uddg") || href;
                
                articles.push({
                    title: title.substring(0, 100),
                    url: actualUrl,
                    type: "article",
                    source: "Medium",
                });
            }
        });

        return articles;
    } catch {
        return [];
    }
}

/**
 * Get official documentation URLs (curated list, no scraping needed)
 */
function getOfficialDocs(topic: string): Resource[] {
    const topicLower = topic.toLowerCase();
    const docs: Resource[] = [];

    // Python
    if (topicLower.includes("python")) {
        docs.push(
            {
                title: "Python Official Documentation",
                url: "https://docs.python.org/3/",
                type: "documentation",
                source: "Official Docs",
            },
            {
                title: "Python Package Index (PyPI)",
                url: "https://pypi.org/",
                type: "documentation",
                source: "Official Docs",
            }
        );
    }

    // JavaScript
    if (topicLower.includes("javascript") || topicLower.includes("js")) {
        docs.push(
            {
                title: "MDN JavaScript Guide",
                url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
                type: "documentation",
                source: "MDN",
            },
            {
                title: "ECMAScript Standard Specification",
                url: "https://tc39.es/ecma262/",
                type: "documentation",
                source: "Official Docs",
            }
        );
    }

    // React
    if (topicLower.includes("react")) {
        docs.push(
            {
                title: "React Documentation",
                url: "https://react.dev/learn",
                type: "documentation",
                source: "Official Docs",
            },
            {
                title: "React API Reference",
                url: "https://react.dev/reference/react",
                type: "documentation",
                source: "Official Docs",
            }
        );
    }

    // Node.js
    if (topicLower.includes("node")) {
        docs.push(
            {
                title: "Node.js Documentation",
                url: "https://nodejs.org/docs/latest/api/",
                type: "documentation",
                source: "Official Docs",
            },
            {
                title: "Node.js API Reference",
                url: "https://nodejs.org/api/",
                type: "documentation",
                source: "Official Docs",
            }
        );
    }

    // TypeScript
    if (topicLower.includes("typescript") || topicLower.includes("ts")) {
        docs.push(
            {
                title: "TypeScript Handbook",
                url: "https://www.typescriptlang.org/docs/handbook/",
                type: "documentation",
                source: "Official Docs",
            },
            {
                title: "TypeScript API Reference",
                url: "https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html",
                type: "documentation",
                source: "Official Docs",
            }
        );
    }

    // Java
    if (topicLower.includes("java") && !topicLower.includes("javascript")) {
        docs.push(
            {
                title: "Java Official Documentation",
                url: "https://docs.oracle.com/en/java/",
                type: "documentation",
                source: "Official Docs",
            },
            {
                title: "Java API Documentation",
                url: "https://docs.oracle.com/en/java/javase/21/docs/api/index.html",
                type: "documentation",
                source: "Official Docs",
            }
        );
    }

    // C++
    if (topicLower.includes("c++") || topicLower.includes("cpp")) {
        docs.push(
            {
                title: "C++ Reference",
                url: "https://en.cppreference.com/w/",
                type: "documentation",
                source: "CPP Reference",
            },
            {
                title: "ISO C++ Standard",
                url: "https://isocpp.org/std/the-standard",
                type: "documentation",
                source: "Official Docs",
            }
        );
    }

    // C#
    if (topicLower.includes("c#") || topicLower.includes("csharp")) {
        docs.push(
            {
                title: "C# Official Documentation",
                url: "https://learn.microsoft.com/en-us/dotnet/csharp/",
                type: "documentation",
                source: "Official Docs",
            },
            {
                title: ".NET Documentation",
                url: "https://learn.microsoft.com/en-us/dotnet/",
                type: "documentation",
                source: "Official Docs",
            }
        );
    }

    // Rust
    if (topicLower.includes("rust")) {
        docs.push(
            {
                title: "The Rust Programming Language Book",
                url: "https://doc.rust-lang.org/book/",
                type: "documentation",
                source: "Official Docs",
            },
            {
                title: "Rust API Documentation",
                url: "https://docs.rs/",
                type: "documentation",
                source: "Official Docs",
            }
        );
    }

    // Go
    if (topicLower.includes("golang") || topicLower.includes(" go ")) {
        docs.push(
            {
                title: "Go Official Documentation",
                url: "https://go.dev/doc/",
                type: "documentation",
                source: "Official Docs",
            },
            {
                title: "Go Package Documentation",
                url: "https://pkg.go.dev/",
                type: "documentation",
                source: "Official Docs",
            }
        );
    }

    // PHP
    if (topicLower.includes("php")) {
        docs.push(
            {
                title: "PHP Official Documentation",
                url: "https://www.php.net/docs.php",
                type: "documentation",
                source: "Official Docs",
            },
            {
                title: "PHP Function Reference",
                url: "https://www.php.net/manual/en/funcref.php",
                type: "documentation",
                source: "Official Docs",
            }
        );
    }

    // SQL/Database
    if (topicLower.includes("sql") || topicLower.includes("database")) {
        docs.push(
            {
                title: "SQL Tutorial - W3Schools",
                url: "https://www.w3schools.com/sql/",
                type: "documentation",
                source: "W3Schools",
            },
            {
                title: "PostgreSQL Documentation",
                url: "https://www.postgresql.org/docs/",
                type: "documentation",
                source: "Official Docs",
            },
            {
                title: "MySQL Documentation",
                url: "https://dev.mysql.com/doc/",
                type: "documentation",
                source: "Official Docs",
            }
        );
    }

    // MongoDB
    if (topicLower.includes("mongodb") || topicLower.includes("nosql")) {
        docs.push(
            {
                title: "MongoDB Official Documentation",
                url: "https://docs.mongodb.com/",
                type: "documentation",
                source: "Official Docs",
            },
            {
                title: "MongoDB University Free Courses",
                url: "https://university.mongodb.com/",
                type: "documentation",
                source: "Official Docs",
            }
        );
    }

    // Data Structures & Algorithms
    if (topicLower.includes("algorithm") || topicLower.includes("data structure")) {
        docs.push(
            {
                title: "Visualgo - Algorithm Visualizations",
                url: "https://visualgo.net/",
                type: "documentation",
                source: "Visualgo",
            },
            {
                title: "Big-O Cheatsheet",
                url: "https://www.bigocheatsheet.com/",
                type: "documentation",
                source: "Reference",
            }
        );
    }

    // Machine Learning / AI
    if (topicLower.includes("machine learning") || topicLower.includes("ml") || topicLower.includes("ai")) {
        docs.push(
            {
                title: "Scikit-learn Documentation",
                url: "https://scikit-learn.org/stable/documentation.html",
                type: "documentation",
                source: "Official Docs",
            },
            {
                title: "TensorFlow Official Documentation",
                url: "https://www.tensorflow.org/learn",
                type: "documentation",
                source: "Official Docs",
            },
            {
                title: "PyTorch Documentation",
                url: "https://pytorch.org/docs/stable/index.html",
                type: "documentation",
                source: "Official Docs",
            }
        );
    }

    // Web Development
    if (topicLower.includes("html") || topicLower.includes("css") || topicLower.includes("web")) {
        docs.push(
            {
                title: "MDN Web Docs",
                url: "https://developer.mozilla.org/en-US/docs/Learn",
                type: "documentation",
                source: "MDN",
            },
            {
                title: "HTML5 Standard Specification",
                url: "https://html.spec.whatwg.org/",
                type: "documentation",
                source: "Official Docs",
            },
            {
                title: "CSS Official Specification",
                url: "https://www.w3.org/Style/CSS/",
                type: "documentation",
                source: "Official Docs",
            }
        );
    }

    // Docker
    if (topicLower.includes("docker") || topicLower.includes("container")) {
        docs.push(
            {
                title: "Docker Official Documentation",
                url: "https://docs.docker.com/",
                type: "documentation",
                source: "Official Docs",
            },
            {
                title: "Docker Hub",
                url: "https://hub.docker.com/",
                type: "documentation",
                source: "Official Docs",
            }
        );
    }

    // Kubernetes
    if (topicLower.includes("kubernetes") || topicLower.includes("k8s")) {
        docs.push(
            {
                title: "Kubernetes Official Documentation",
                url: "https://kubernetes.io/docs/",
                type: "documentation",
                source: "Official Docs",
            },
            {
                title: "Kubernetes API Reference",
                url: "https://kubernetes.io/docs/reference/",
                type: "documentation",
                source: "Official Docs",
            }
        );
    }

    // AWS
    if (topicLower.includes("aws") || topicLower.includes("amazon")) {
        docs.push(
            {
                title: "AWS Documentation",
                url: "https://docs.aws.amazon.com/",
                type: "documentation",
                source: "Official Docs",
            },
            {
                title: "AWS Services Reference",
                url: "https://docs.aws.amazon.com/index.html?nc2=h_ql_doc_do",
                type: "documentation",
                source: "Official Docs",
            }
        );
    }

    // Google Cloud / GCP
    if (topicLower.includes("google cloud") || topicLower.includes("gcp")) {
        docs.push(
            {
                title: "Google Cloud Documentation",
                url: "https://cloud.google.com/docs",
                type: "documentation",
                source: "Official Docs",
            },
            {
                title: "Google Cloud Services",
                url: "https://cloud.google.com/products",
                type: "documentation",
                source: "Official Docs",
            }
        );
    }

    // Azure
    if (topicLower.includes("azure") || topicLower.includes("microsoft")) {
        docs.push(
            {
                title: "Azure Documentation",
                url: "https://learn.microsoft.com/en-us/azure/",
                type: "documentation",
                source: "Official Docs",
            },
            {
                title: "Azure Services Reference",
                url: "https://learn.microsoft.com/en-us/azure/?product=featured",
                type: "documentation",
                source: "Official Docs",
            }
        );
    }

    // Networking
    if (topicLower.includes("network") || topicLower.includes("tcp") || topicLower.includes("http") || topicLower.includes("api")) {
        docs.push(
            {
                title: "HTTP/HTTPS Specifications",
                url: "https://tools.ietf.org/html/rfc7230",
                type: "documentation",
                source: "Official Docs",
            },
            {
                title: "TCP/IP Protocol Suite",
                url: "https://tools.ietf.org/html/rfc793",
                type: "documentation",
                source: "Official Docs",
            },
            {
                title: "REST API Best Practices",
                url: "https://restfulapi.net/",
                type: "documentation",
                source: "Reference",
            }
        );
    }

    // Return all applicable docs (increased from 1)
    return docs;
}

/**
 * Search FreeCodeCamp (they have good tutorials)
 */
async function scrapeFreeCodeCamp(query: string, maxResults: number = 2): Promise<Resource[]> {
    try {
        const encodedQuery = encodeURIComponent(query);
        const url = `https://www.freecodecamp.org/news/search/?query=${encodedQuery}`;
        
        const response = await axios.get(url, {
            headers: { "User-Agent": USER_AGENT },
            timeout: 10000,
        });

        const $ = cheerio.load(response.data as string);
        const articles: Resource[] = [];

        $("article a.post-card-title, .post-card a").each((_, el) => {
            if (articles.length >= maxResults) return false;
            
            const $el = $(el);
            const href = $el.attr("href");
            const title = $el.text().trim();
            
            if (href && title) {
                const fullUrl = href.startsWith("http") ? href : `https://www.freecodecamp.org${href}`;
                articles.push({
                    title: title.substring(0, 100),
                    url: fullUrl,
                    type: "article",
                    source: "freeCodeCamp",
                });
            }
        });

        return articles;
    } catch {
        return [];
    }
}

/**
 * Scrape Stack Overflow questions and answers
 */
async function scrapeStackOverflow(query: string, maxResults: number = 2): Promise<Resource[]> {
    try {
        const encodedQuery = encodeURIComponent(query);
        const url = `https://stackoverflow.com/search?q=${encodedQuery}&tab=newest`;
        
        const response = await axios.get(url, {
            headers: { "User-Agent": USER_AGENT },
            timeout: 10000,
        });

        const $ = cheerio.load(response.data as string);
        const questions: Resource[] = [];

        $("a.s-link").each((_, el) => {
            if (questions.length >= maxResults) return false;
            
            const $el = $(el);
            const href = $el.attr("href");
            const title = $el.text().trim();
            
            if (href && title && !href.includes("login")) {
                const fullUrl = `https://stackoverflow.com${href}`;
                questions.push({
                    title: title.substring(0, 100),
                    url: fullUrl,
                    type: "article",
                    source: "Stack Overflow",
                });
            }
        });

        return questions;
    } catch {
        return [];
    }
}

/**
 * Scrape GitHub repositories
 */
async function scrapeGitHubRepos(query: string, maxResults: number = 2): Promise<Resource[]> {
    try {
        const encodedQuery = encodeURIComponent(query);
        const url = `https://github.com/search?q=${encodedQuery}&sort=stars&type=repositories`;
        
        const response = await axios.get(url, {
            headers: { "User-Agent": USER_AGENT },
            timeout: 10000,
        });

        const $ = cheerio.load(response.data as string);
        const repos: Resource[] = [];

        $("a[data-testid='repository-name-heading']").each((_, el) => {
            if (repos.length >= maxResults) return false;
            
            const $el = $(el);
            const href = $el.attr("href");
            const title = $el.text().trim();
            
            if (href && title) {
                const fullUrl = `https://github.com${href}`;
                repos.push({
                    title: title.substring(0, 100),
                    url: fullUrl,
                    type: "project",
                    source: "GitHub",
                });
            }
        });

        return repos;
    } catch {
        return [];
    }
}

/**
 * Scrape Hashnode articles
 */
async function scrapeHashnode(query: string, maxResults: number = 2): Promise<Resource[]> {
    try {
        const encodedQuery = encodeURIComponent(query);
        const url = `https://hashnode.com/search?q=${encodedQuery}`;
        
        const response = await axios.get(url, {
            headers: { "User-Agent": USER_AGENT },
            timeout: 10000,
        });

        const $ = cheerio.load(response.data as string);
        const articles: Resource[] = [];

        $("a[data-testid='blog-card-title-link']").each((_, el) => {
            if (articles.length >= maxResults) return false;
            
            const $el = $(el);
            const href = $el.attr("href");
            const title = $el.text().trim();
            
            if (href && title) {
                const fullUrl = href.startsWith("http") ? href : `https://hashnode.com${href}`;
                articles.push({
                    title: title.substring(0, 100),
                    url: fullUrl,
                    type: "article",
                    source: "Hashnode",
                });
            }
        });

        return articles;
    } catch {
        return [];
    }
}

/**
 * Scrape CSS-Tricks articles
 */
async function scrapeCssTricks(query: string, maxResults: number = 2): Promise<Resource[]> {
    try {
        const encodedQuery = encodeURIComponent(query);
        const url = `https://css-tricks.com/?s=${encodedQuery}`;
        
        const response = await axios.get(url, {
            headers: { "User-Agent": USER_AGENT },
            timeout: 10000,
        });

        const $ = cheerio.load(response.data as string);
        const articles: Resource[] = [];

        $("article h2 a, .post-title a").each((_, el) => {
            if (articles.length >= maxResults) return false;
            
            const $el = $(el);
            const href = $el.attr("href");
            const title = $el.text().trim();
            
            if (href && title) {
                articles.push({
                    title: title.substring(0, 100),
                    url: href,
                    type: "article",
                    source: "CSS-Tricks",
                });
            }
        });

        return articles;
    } catch {
        return [];
    }
}

/**
 * Scrape Smashing Magazine articles
 */
async function scrapeSmashingMagazine(query: string, maxResults: number = 2): Promise<Resource[]> {
    try {
        const encodedQuery = encodeURIComponent(query);
        const url = `https://www.smashingmagazine.com/?s=${encodedQuery}`;
        
        const response = await axios.get(url, {
            headers: { "User-Agent": USER_AGENT },
            timeout: 10000,
        });

        const $ = cheerio.load(response.data as string);
        const articles: Resource[] = [];

        $("article h2 a, .article-headline a").each((_, el) => {
            if (articles.length >= maxResults) return false;
            
            const $el = $(el);
            const href = $el.attr("href");
            const title = $el.text().trim();
            
            if (href && title) {
                articles.push({
                    title: title.substring(0, 100),
                    url: href,
                    type: "article",
                    source: "Smashing Magazine",
                });
            }
        });

        return articles;
    } catch {
        return [];
    }
}

/**
 * Scrape Udemy courses (free)
 */
async function scrapeUdemyFree(query: string, maxResults: number = 2): Promise<Resource[]> {
    try {
        // Udemy free courses search
        const encodedQuery = encodeURIComponent(query);
        const url = `https://www.udemy.com/courses/search/?q=${encodedQuery}&price=price-free`;
        
        const response = await axios.get(url, {
            headers: { "User-Agent": USER_AGENT },
            timeout: 10000,
        });

        const $ = cheerio.load(response.data as string);
        const courses: Resource[] = [];

        $("a[data-testid='course-card-clickable']").each((_, el) => {
            if (courses.length >= maxResults) return false;
            
            const $el = $(el);
            const href = $el.attr("href");
            const title = $el.text().trim();
            
            if (href && title && href.includes("udemy.com")) {
                courses.push({
                    title: title.substring(0, 100),
                    url: href.startsWith("http") ? href : `https://www.udemy.com${href}`,
                    type: "video",
                    source: "Udemy (Free)",
                });
            }
        });

        return courses;
    } catch {
        return [];
    }
}

/**
 * Scrape Coursera free courses
 */
async function scrapeCoursera(query: string, maxResults: number = 2): Promise<Resource[]> {
    try {
        const encodedQuery = encodeURIComponent(query);
        const url = `https://www.coursera.org/search?query=${encodedQuery}&index=prod_all_launched_products`;
        
        const response = await axios.get(url, {
            headers: { "User-Agent": USER_AGENT },
            timeout: 10000,
        });

        const $ = cheerio.load(response.data as string);
        const courses: Resource[] = [];

        $("a[data-test='search-result-link']").each((_, el) => {
            if (courses.length >= maxResults) return false;
            
            const $el = $(el);
            const href = $el.attr("href");
            const title = $el.text().trim();
            
            if (href && title) {
                const fullUrl = href.startsWith("http") ? href : `https://www.coursera.org${href}`;
                courses.push({
                    title: title.substring(0, 100),
                    url: fullUrl,
                    type: "video",
                    source: "Coursera",
                });
            }
        });

        return courses;
    } catch {
        return [];
    }
}

/**
 * Scrape LinkedIn Learning articles
 */
async function scrapeLinkedInLearning(query: string, maxResults: number = 2): Promise<Resource[]> {
    try {
        const encodedQuery = encodeURIComponent(query);
        const url = `https://www.linkedin.com/learning/search?keywords=${encodedQuery}`;
        
        const response = await axios.get(url, {
            headers: { "User-Agent": USER_AGENT },
            timeout: 10000,
        });

        const $ = cheerio.load(response.data as string);
        const courses: Resource[] = [];

        $("a.course-card__link").each((_, el) => {
            if (courses.length >= maxResults) return false;
            
            const $el = $(el);
            const href = $el.attr("href");
            const title = $el.text().trim();
            
            if (href && title) {
                courses.push({
                    title: title.substring(0, 100),
                    url: `https://www.linkedin.com${href}`,
                    type: "video",
                    source: "LinkedIn Learning",
                });
            }
        });

        return courses;
    } catch {
        return [];
    }
}

/**
 * Main function: Scrape ALL sources and return real resources
 * Uses Redis caching to avoid repeated scraping
 */
export async function scrapeRealResources(topicTitle: string, topicDescription: string): Promise<Resource[]> {
    const searchQuery = `${topicTitle}`;
    const cacheKey = `resources:${searchQuery.toLowerCase().replace(/\s+/g, "-").substring(0, 50)}`;

    // Check cache first (24 hour cache for resources)
    const cached = await getFromCache<Resource[]>(cacheKey);
    if (cached && cached.length > 0) {
        console.log(`📦 Resource cache hit for "${topicTitle}"`);
        return cached;
    }

    console.log(`🔍 Scraping resources for: "${topicTitle}"`);

    // Run ALL scrapers in parallel for speed - NOW INCLUDING 13 SOURCES
    const [
        youtubeVideos, 
        devToArticles, 
        gfgTutorials, 
        mediumArticles, 
        fccTutorials,
        stackOverflowQuestions,
        githubRepos,
        hashnodeArticles,
        cssTricksArticles,
        smashingArticles,
        udemyFreeCourses,
        courseraCourses,
        linkedinLearning
    ] = await Promise.all([
        scrapeYouTube(searchQuery, 4),              // YouTube videos
        scrapeDevTo(topicTitle.split(" ")[0], 3),  // Dev.to articles
        scrapeGeeksForGeeks(searchQuery, 3),       // GeeksForGeeks
        scrapeMedium(searchQuery, 2),              // Medium articles
        scrapeFreeCodeCamp(searchQuery, 2),        // freeCodeCamp
        scrapeStackOverflow(searchQuery, 2),       // Stack Overflow
        scrapeGitHubRepos(searchQuery, 2),         // GitHub repos
        scrapeHashnode(searchQuery, 2),            // Hashnode
        scrapeCssTricks(searchQuery, 2),           // CSS-Tricks (web dev)
        scrapeSmashingMagazine(searchQuery, 2),    // Smashing Magazine
        scrapeUdemyFree(searchQuery, 2),           // Udemy Free Courses
        scrapeCoursera(searchQuery, 2),            // Coursera
        scrapeLinkedInLearning(searchQuery, 2),    // LinkedIn Learning
    ]);

    // Get official docs (no scraping, instant) - now returns multiple docs instead of 1
    const officialDocs = getOfficialDocs(topicTitle);

    // Combine ALL resources with MUCH HIGHER DIVERSITY
    const allResources = [
        ...youtubeVideos.slice(0, 4),              // Max 4 videos (YouTube)
        ...officialDocs.slice(0, 4),               // Max 4 official docs
        ...devToArticles.slice(0, 2),              // Max 2 dev.to
        ...gfgTutorials.slice(0, 2),               // Max 2 GFG
        ...mediumArticles.slice(0, 2),             // Max 2 Medium
        ...fccTutorials.slice(0, 2),               // Max 2 freeCodeCamp
        ...stackOverflowQuestions.slice(0, 2),     // Max 2 Stack Overflow
        ...githubRepos.slice(0, 2),                // Max 2 GitHub repos/projects
        ...hashnodeArticles.slice(0, 2),           // Max 2 Hashnode
        ...cssTricksArticles.slice(0, 1),          // Max 1 CSS-Tricks
        ...smashingArticles.slice(0, 1),           // Max 1 Smashing Magazine
        ...udemyFreeCourses.slice(0, 1),           // Max 1 Udemy Free
        ...courseraCourses.slice(0, 1),            // Max 1 Coursera
        ...linkedinLearning.slice(0, 1),           // Max 1 LinkedIn Learning
    ];

    // Remove duplicates by URL
    const uniqueResources = allResources.filter(
        (resource, index, self) =>
            index === self.findIndex((r) => r.url === resource.url)
    );

    console.log(`✅ Found ${uniqueResources.length} resources for "${topicTitle}"`);

    // Cache for 24 hours
    if (uniqueResources.length > 0) {
        await setToCache(cacheKey, uniqueResources, 86400);
    }

    return uniqueResources;
}

/**
 * Batch scrape resources for multiple topics
 * With delays to avoid being blocked
 */
export async function scrapeResourcesForTopics(
    topics: Array<{ title: string; description: string }>
): Promise<Array<{ topicTitle: string; resources: Resource[] }>> {
    const results: Array<{ topicTitle: string; resources: Resource[] }> = [];

    for (const topic of topics) {
        const resources = await scrapeRealResources(topic.title, topic.description);
        results.push({
            topicTitle: topic.title,
            resources,
        });

        // Small delay between topics to avoid rate limiting
        if (topics.indexOf(topic) < topics.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 300));
        }
    }

    return results;
}
/**
 * Generate related/reference links for a module based on its title
 * These are curated links that complement the main resources
 */
export function generateRelatedLinks(moduleTitle: string): Array<{ title: string; url: string; category: string }> {
    const moduleLower = moduleTitle.toLowerCase();
    const relatedLinks: Array<{ title: string; url: string; category: string }> = [];

    // Community & Q&A Resources
    relatedLinks.push({
        title: "Stack Overflow Community",
        url: "https://stackoverflow.com/",
        category: "Community"
    });

    relatedLinks.push({
        title: "Reddit r/learnprogramming",
        url: "https://www.reddit.com/r/learnprogramming/",
        category: "Community"
    });

    relatedLinks.push({
        title: "Dev.to Community",
        url: "https://dev.to/",
        category: "Community"
    });

    // Tools & IDE Resources
    relatedLinks.push({
        title: "Visual Studio Code",
        url: "https://code.visualstudio.com/",
        category: "Tools"
    });

    relatedLinks.push({
        title: "GitHub - Version Control",
        url: "https://github.com/",
        category: "Tools"
    });

    if (moduleLower.includes("javascript") || moduleLower.includes("web") || moduleLower.includes("react") || moduleLower.includes("typescript")) {
        relatedLinks.push({
            title: "npm - JavaScript Package Manager",
            url: "https://www.npmjs.com/",
            category: "Tools"
        });

        relatedLinks.push({
            title: "Chrome DevTools Guide",
            url: "https://developer.chrome.com/docs/devtools/",
            category: "Tools"
        });
    }

    if (moduleLower.includes("python")) {
        relatedLinks.push({
            title: "Python Package Index (PyPI)",
            url: "https://pypi.org/",
            category: "Tools"
        });

        relatedLinks.push({
            title: "Anaconda - Python Distribution",
            url: "https://www.anaconda.com/",
            category: "Tools"
        });
    }

    // Testing & Quality Resources
    if (moduleLower.includes("test") || moduleLower.includes("jest") || moduleLower.includes("testing")) {
        relatedLinks.push({
            title: "Jest Testing Framework",
            url: "https://jestjs.io/",
            category: "Testing"
        });

        relatedLinks.push({
            title: "Mocha Test Framework",
            url: "https://mochajs.org/",
            category: "Testing"
        });
    }

    // Web Development Specific
    if (moduleLower.includes("html") || moduleLower.includes("css") || moduleLower.includes("web") || moduleLower.includes("react")) {
        relatedLinks.push({
            title: "Can I Use - Browser Compatibility",
            url: "https://caniuse.com/",
            category: "Reference"
        });

        relatedLinks.push({
            title: "MDN Web Docs",
            url: "https://developer.mozilla.org/",
            category: "Reference"
        });

        relatedLinks.push({
            title: "CSS Reference Guide",
            url: "https://cssreference.io/",
            category: "Reference"
        });
    }

    // Database Resources
    if (moduleLower.includes("database") || moduleLower.includes("sql") || moduleLower.includes("mongodb") || moduleLower.includes("postgres")) {
        relatedLinks.push({
            title: "DB Fiddle - Online SQL Editor",
            url: "https://www.db-fiddle.com/",
            category: "Tools"
        });

        relatedLinks.push({
            title: "MongoDB Atlas",
            url: "https://www.mongodb.com/cloud/atlas",
            category: "Tools"
        });
    }

    // DevOps & Cloud
    if (moduleLower.includes("docker") || moduleLower.includes("kubernetes") || moduleLower.includes("aws") || moduleLower.includes("cloud")) {
        relatedLinks.push({
            title: "Docker Hub",
            url: "https://hub.docker.com/",
            category: "Cloud"
        });

        relatedLinks.push({
            title: "AWS Free Tier",
            url: "https://aws.amazon.com/free/",
            category: "Cloud"
        });

        relatedLinks.push({
            title: "Google Cloud Free Tier",
            url: "https://cloud.google.com/free",
            category: "Cloud"
        });
    }

    // AI/ML Resources
    if (moduleLower.includes("machine learning") || moduleLower.includes("ai") || moduleLower.includes("tensorflow") || moduleLower.includes("pytorch")) {
        relatedLinks.push({
            title: "Google Colab - Free ML Notebooks",
            url: "https://colab.research.google.com/",
            category: "Tools"
        });

        relatedLinks.push({
            title: "Kaggle - ML Competitions",
            url: "https://www.kaggle.com/",
            category: "Community"
        });
    }

    // General Learning Platforms
    relatedLinks.push({
        title: "Codecademy - Interactive Learning",
        url: "https://www.codecademy.com/",
        category: "Learning Platform"
    });

    relatedLinks.push({
        title: "Exercism - Code Practice",
        url: "https://exercism.org/",
        category: "Practice"
    });

    relatedLinks.push({
        title: "LeetCode - Interview Prep",
        url: "https://leetcode.com/",
        category: "Practice"
    });

    relatedLinks.push({
        title: "HackerRank - Coding Challenges",
        url: "https://www.hackerrank.com/",
        category: "Practice"
    });

    // Documentation Hubs
    relatedLinks.push({
        title: "DevDocs - Offline Documentation",
        url: "https://devdocs.io/",
        category: "Reference"
    });

    relatedLinks.push({
        title: "Awesome Lists - Curated Resources",
        url: "https://github.com/sindresorhus/awesome",
        category: "Reference"
    });

    return relatedLinks;
}